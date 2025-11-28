const express = require('express');
const Record = require('../models/Record');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/summary', requireAuth, async (req, res) => {
  try {
    const totalRecords = await Record.countDocuments();
    const totalUsers = await User.countDocuments();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRecords = await Record.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const categories = await Record.distinct('category');

    const recordsByCategory = await Record.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const previousMonth = new Date();
    previousMonth.setDate(previousMonth.getDate() - 60);
    const lastMonthRecords = await Record.countDocuments({
      createdAt: { $gte: previousMonth, $lt: thirtyDaysAgo }
    });

    const growthPercentage = lastMonthRecords > 0
      ? ((recentRecords - lastMonthRecords) / lastMonthRecords * 100).toFixed(1)
      : 0;

    res.json({
      totalRecords,
      totalUsers,
      recentRecords,
      categories: categories.length,
      recordsByCategory,
      growthPercentage: parseFloat(growthPercentage),
      topCategories: recordsByCategory.sort((a, b) => b.count - a.count).slice(0, 5)
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

router.get('/charts/:type', requireAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { period = '30d' } = req.query;

    let startDate = new Date();
    let groupBy = {};

    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        groupBy = {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        };
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        groupBy = {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        };
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        groupBy = {
          $dateToString: { format: '%Y-%m-%W', date: '$createdAt' }
        };
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupBy = {
          $dateToString: { format: '%Y-%m', date: '$createdAt' }
        };
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
        groupBy = {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        };
    }

    let chartData = [];

    switch (type) {
      case 'line':
        chartData = await Record.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: groupBy,
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
        break;

      case 'bar':
        chartData = await Record.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { count: -1 }
          },
          {
            $limit: 10
          }
        ]);
        break;

      case 'pie':
        chartData = await Record.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { count: -1 }
          }
        ]);
        break;

      case 'area':
        const dailyData = await Record.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: groupBy,
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);

        let cumulative = 0;
        chartData = dailyData.map(item => {
          cumulative += item.count;
          return {
            _id: item._id,
            count: cumulative
          };
        });
        break;

      default:
        return res.status(400).json({ error: 'Invalid chart type' });
    }

    res.json({
      type,
      period,
      data: chartData,
      total: chartData.reduce((sum, item) => sum + item.count, 0)
    });
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

router.get('/realtime', requireAuth, async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentRecords = await Record.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });

    const activeUsers = await Record.distinct('userId', {
      createdAt: { $gte: oneHourAgo }
    });

    const topCategory = await Record.aggregate([
      {
        $match: {
          createdAt: { $gte: oneHourAgo }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      }
    ]);

    res.json({
      recentRecords,
      activeUsers: activeUsers.length,
      topCategory: topCategory[0] || null,
      timestamp: now
    });
  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch real-time statistics' });
  }
});

router.get('/stocks/:symbol', requireAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval } = req.query;
    const { getIntradayData } = require('../services/alphaVantage');

    const data = await getIntradayData(symbol, interval);
    res.json(data);
  } catch (error) {
    console.error('Stock data error:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

module.exports = router;