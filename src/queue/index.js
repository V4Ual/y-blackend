import amqp from "amqplib";
let connection;
export const checkRabbitMQConnection = async () => {
  try {
    if (!connection) {
      connection = await amqp.connect("amqp://localhost");
    }
    return connection;
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error.message);
  }
};

// upload video process channel

export const sendVideoInProcess = async ({
  inputPath,
  outputDir,
  thumbnailPath,
  userId,
  videoId,
}) => {
  const connection = await checkRabbitMQConnection();
  const channel = await connection.createChannel();
  const queue = "videoProcess";

  await channel.assertQueue(queue, {
    durable: false,
  });

  channel.sendToQueue(
    queue,
    Buffer.from(
      JSON.stringify({
        inputPath: inputPath,
        outputDir: outputDir,
        thumbnailPath: thumbnailPath,
        userId: userId,
        videoId: videoId,
      })
    )
  );

  await channel.close();
};
