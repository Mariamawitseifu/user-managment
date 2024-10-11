const Queue = require('bull');

const myQueue = new Queue('myQueueName', {
  redis: {
    port: 6379,
    host: '127.0.0.1'
  }
});

myQueue.process(async (job) => {
  console.log(job.data);
  // Do some work here
});

module.exports = myQueue;