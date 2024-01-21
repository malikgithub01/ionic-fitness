import { useRef, useState, useEffect } from 'react';
import BackgroundGeolocation from "@transistorsoft/capacitor-background-geolocation";
import { useJsApiLoader, GoogleMap, Circle, Polyline } from '@react-google-maps/api';


const RunningScreen: React.FC = () => {

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyATpg24pvyAd5226-9H8m4np4lDI0Fn0o4"
  })

  const center = {
    lat: 52.5025,
    lng: 13.4101
  };
  const [map, setMap] = useState<any>(/** @type google.maps.Map */(null))
  const [startingPoint, setStartingPoint] = useState<any>(null);
  const [initialLocation, setInitialLocation] = useState<any>(null)
  const [isTracking, setIsTracking] = useState<any>(false);
  const [time, setTime] = useState<any>({ hours: 0, minutes: 0, seconds: 0 });
  const [minutesForKm, setMinutesForKm] = useState<any>({ minutes: 0, seconds: 0 })
  const [averagePace, setAveragePace] = useState<any>(0)
  const [totalDistance, setTotalDistance] = useState<any>(0);
  const [finalRegion, setFinalRegion] = useState<any>(null)
  const [endPoint, setEndPoint] = useState<any>(null)
  const [routeCoordinates, setRouteCoordinates] = useState<any>([]);
  const [runFinished, setRunFinished] = useState<any>(false)


  useEffect(() => {

    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
      stopTimeout: 15,
      debug: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,
      startOnBoot: false,
    }).then(() => {
      BackgroundGeolocation.watchPosition((location) => {
        setInitialLocation(location.coords)
      })
    })

  }, [])

  if (!isLoaded || !initialLocation) {
    return <div>
      Loading...
    </div>
  }

  return (
    <>
      <GoogleMap
        mapContainerStyle={{
          width: 400,
          height: 400
        }}
        center={{
            lat: initialLocation?.latitude,
            lng: initialLocation?.longitude
        }}
        zoom={15}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: false,
          gestureHandling: 'none'
        }}
        onLoad={map => {
          setMap(map);
        }}
      >

        <Circle
          center={{
            lat: 52.5025,
            lng: 13.4101
          }}
          radius={10}
          options={{
            fillColor: "#f21b1e",
            strokeWeight: 3,
            strokeColor: "rgba(255, 255, 255, 1)",
          }}
        />
        <Circle
          center={{
            lat: 52.5035,
            lng: 13.4111
          }}
          radius={10}
          options={{
            fillColor: "#20961e",
            strokeWeight: 3,
            strokeColor: "rgba(255, 255, 255, 1)",
            zIndex: 2
          }}
        />
        <Polyline
          path={routeCoordinates}
          options={{
            strokeColor: "#ff2527",
            strokeWeight: 4,
            zIndex: 1
          }}
        />

      </GoogleMap>
    </>

  )
}

export default RunningScreen;