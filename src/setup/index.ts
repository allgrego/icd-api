const getChaptersStructure = () => new Promise((resolve, reject) =>{
  resolve("a");
});

/**
 * Main function
 * @return {void}
 */
async function main() {
  const chapters = await getChaptersStructure();
  console.log(chapters);
  return;
}

main();
