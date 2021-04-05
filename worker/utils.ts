export const isHtmlRequest = (url: URL) => {
  const pieces = url.pathname.split('/');
  const last = pieces[pieces.length - 1];
  const containsDot = last.indexOf('.') > -1;
  return !containsDot;
};

export const isListRequest = (url: URL) => {
  return url.pathname.indexOf('/uniform/list') > -1;
};
