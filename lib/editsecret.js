const finalizeEdit = ({
  secret,
  updatingKey,
  newValue,
}) => {
  const finalValue = newValue.trim();
  let notes = '';
  if (finalValue.length < newValue.length ) {
    notes = 'Trimmed spaces and newlines before applying';
  }
  return {
    secret,
    updatingKey,
    oldValue: secret.data[updatingKey].decoded,
    newValue: finalValue,
    notes,
  };
};

module.exports = {
  finalizeEdit,
};
