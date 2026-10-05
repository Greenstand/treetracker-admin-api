import seed from './seed';

seed
  .seed()
  .then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
