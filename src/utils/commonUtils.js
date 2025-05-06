export const commonUtils = {
  generateImageName: () => {
    return `yt-${Date.now()}.png`;
  },
  generateVideoName: () => {
    return `yt-${Date.now()}.mp4`;
  },

  generateVideoId: (length = 11) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  getPagination: async ({
    model,
    currentPage = 1,
    pageSize = 10,
    condition,
  }) => {
    const totalRecord = await model.countDocuments(condition);
    const totalPage = Math.ceil(totalRecord / pageSize);
    const skip = (currentPage - 1) * pageSize;

    const findAll = await model.find(condition);

    return {
      currentPage: currentPage,
      totalItem: totalRecord,
      totalPage: totalPage,
      skip: skip,
      data: findAll,
    };
  },

  convertSecondsToHHMMSS: (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedTime = [  
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      remainingSeconds.toString().padStart(2, "0"),
    ].join(":");

    return formattedTime;
  },
};
