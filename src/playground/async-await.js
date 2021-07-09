const add = (a, b) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(a + b);
    }, 2000);
  });
};

const doAsync = async () => {
  const sum = await add(1, 2);
  const sum2 = await add(sum, 4);
  return await add(sum2, 3);
};

doAsync().then((result) => console.log(result));
