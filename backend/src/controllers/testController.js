const testHello = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'Hello from IS212-G8T4 Backend! 👋',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  testHello
};
