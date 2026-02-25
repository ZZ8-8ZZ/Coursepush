export const buildSuccessPayload = (data = null, meta = null) => ({
  success: true,
  data,
  meta,
});

export const sendSuccess = (res, data, { statusCode = 200, meta = null } = {}) => {
  return res.status(statusCode).json(buildSuccessPayload(data, meta));
};

export const sendNoContent = (res) => {
  return res.status(204).send();
};
