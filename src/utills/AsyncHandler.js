const asyncHandler = (asyncFn) => async (req, res, next) => {
  try {
    await asyncFn(req, res, next);
  } catch (error) {
    res.status(error?.statusCode || 500).json({
      success: false,
      message: error.message || 'Something went wrong',
      errors: error?.errors || [],
    });
  }
};

export { asyncHandler };
