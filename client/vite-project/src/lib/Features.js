const fileformat = (url) => {

  const fileExtension = url.split(".").pop();

  if (fileExtension === "mp4" || fileExtension === "webm" || fileExtension === "ogg") return "vedio";

  if (fileExtension === "mp3" || fileExtension === "wav") return "audio";
  if (fileExtension === "png" || fileExtension === "jpg" || fileExtension === "jpeg" || fileExtension === "gif") return "image";

};

export const transformimage = (url = "", width = 100) => {
  return url
}

export default fileformat;