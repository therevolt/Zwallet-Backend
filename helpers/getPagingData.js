const getPagingData = (data, page, limit) => {
  const wallets = data.rows;
  const { count: totalItems } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, wallets, totalPages, currentPage };
};

module.exports = getPagingData;
