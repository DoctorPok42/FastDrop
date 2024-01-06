import getDeviceType from "./getDeviceType";

const askForLocationPermission = async (
  mySocket: any,
  username: string,
  privacyLevel: string,
  setError: (error: string | null) => void,
  setPrivacyLevel: (privacyLevel: string) => void,
  getDeviceType: any,
) => {
  try {
    await navigator.geolocation.getCurrentPosition(
      () => {},
      () => {},
      {}
    );
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    );
    setError(null);

    mySocket &&
      position.coords != null &&
      mySocket.emit("updatePrivacyLevel", {
        name: username,
        deviceType: getDeviceType(),
        privacyLevel: privacyLevel,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });

    return position.coords.latitude;
  } catch (error) {
    console.error("Permission denied or error:", error);
    setError("Please allow location to use this privacy level");
    setPrivacyLevel("1");
  }
};

export default askForLocationPermission
