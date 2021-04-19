const getPagingData = (data, page, limit) => {
  const products = data.rows.map((item) => {
    item.size = JSON.parse(item.size);
    item.deliveryMethod = JSON.parse(item.deliveryMethod);
    return item;
  });
  const { count: totalItems } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, products, totalPages, currentPage };
};

module.exports = getPagingData;
