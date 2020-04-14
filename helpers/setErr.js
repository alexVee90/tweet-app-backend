
module.exports = (status, reason, inTry = true, next) => { 
  const error = new Error('Error');
  error.status = status;
  error.msg = 'failure';
  error.reason = reason;
  if(inTry) { 
    throw error;
  } else { 
    next(error);
  }
}