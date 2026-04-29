export const buildSuccessPayload = (data = null, meta = null) => {
  const payload = {
    success: true,
  };

  if (meta !== null) {
    payload.meta = meta;
  }

  payload.data = data;
  return payload;
};

export const sendSuccess = (res, data, { statusCode = 200, meta = null } = {}) => {
  return res.status(statusCode).json(buildSuccessPayload(data, meta));
};

export const sendNoContent = (res) => {
  return res.status(204).send();
};
