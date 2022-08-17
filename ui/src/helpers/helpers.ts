type IPosition = "topR" | "topL" | "bottomR" | "bottomL";

type notifyType = "error" | "info" | "success" | "warning";

type NotficationType = {
  type: notifyType,
  title: string,
  message: string,
  icon: undefined,
  position: IPosition
}

export const getNotification = (type: notifyType, title: string, message: string) => {
  const toReturn: NotficationType = {
    type: type,
    title: title,
    message: message,
    icon: undefined,
    position: "topR"
  };
  return toReturn;
};