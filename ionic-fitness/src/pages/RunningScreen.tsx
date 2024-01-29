import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import BackgroundGeolocation from "@transistorsoft/capacitor-background-geolocation";
import { useJsApiLoader, GoogleMap, Circle, Polyline } from '@react-google-maps/api';
import './RunningScreen.css'

const RunningScreen: React.FC = () => {

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyATpg24pvyAd5226-9H8m4np4lDI0Fn0o4"
  })

  const [map, setMap] = useState<any>(/** @type google.maps.Map */(null))
  const [startingPoint, setStartingPoint] = useState<any>(null);
  const [isTracking, setIsTracking] = useState<any>(false);
  const [time, setTime] = useState<any>({ hours: 0, minutes: 0, seconds: 0 });
  const [minutesForKm, setMinutesForKm] = useState<any>({ minutes: 0, seconds: 0 })
  const [averagePace, setAveragePace] = useState<number>(0)
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [finalRegion, setFinalRegion] = useState<any>(null)
  const [endPoint, setEndPoint] = useState<any>(null)
  const [routeCoordinates, setRouteCoordinates] = useState<any>([]);
  const [runFinished, setRunFinished] = useState<any>(false)
  const [keys, setKeys] = useState<any>()

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
        setEndPoint(location.coords);
      }, (errorCode) => {
        console.log("[watchPosition] ERROR -", errorCode);
      }, {
        interval: 1000,
      });
    })
    
    return () => {
      BackgroundGeolocation.stopWatchPosition()
    }


  }, [])

  useEffect(() => {
    if (isTracking) {
      setRouteCoordinates((prevRouteCoordinates: any) => {
        const newCoordinate = {
          lat: endPoint.latitude,
          lng: endPoint.longitude,
        };
        calculateDistance(prevRouteCoordinates, newCoordinate);
        return [...prevRouteCoordinates, newCoordinate];
      });
    }
  }, [endPoint]);

  useEffect(() => {
    let interval: any;

    if (isTracking) {
      interval = setInterval(() => {
        setTime((prevTimer: any) => {
          const newSeconds = prevTimer.seconds + 1;

          if (newSeconds === 60) {
            const newMinutes = prevTimer.minutes + 1;
            return { hours: prevTimer.hours, minutes: newMinutes, seconds: 0 };
          }

          if (prevTimer.minutes === 60) {
            const newHours = prevTimer.hours + 1;
            return { hours: newHours, minutes: 0, seconds: 0 };
          }

          return { ...prevTimer, seconds: newSeconds };
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isTracking]);

  useEffect(() => {
    if (isTracking) {
      calculatePace()
    }
  }, [time])

  const startTrackingRoute = async () => {
    setStartingPoint(endPoint)
    setIsTracking((prevIsTracking: any) => !prevIsTracking);
  }

  const stopTrackingRoute = async () => {
    setIsTracking(false)
    setRunFinished(true)
    calculatePace()
    if (routeCoordinates.length > 0) {
      const lats = routeCoordinates.map((coord: any) => coord.lat);
      const lons = routeCoordinates.map((coord: any) => coord.lng);

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);

      const newRegion = {
        lat: (minLat + maxLat) / 2,
        lng: (minLon + maxLon) / 2,
        zoom: 7
      }
      setFinalRegion(newRegion)
      // mapViewRef.current.animateToRegion(newRegion, 1000);
    }
  }

  const calculatePace = () => {
    const totalTime: number = time.hours + time.minutes / 60 + time.seconds / 3600;
    const totalTimeInSeconds: number = time.hours * 3600 + time.minutes * 60 + time.seconds;
    if (totalTime !== 0) {
      const averageSpeed: number = parseFloat((totalDistance / totalTime).toFixed(2));
      setAveragePace(averageSpeed);
      const secondsPerKm = totalTimeInSeconds / totalDistance;
      const minutes = Math.floor(secondsPerKm / 60);
      const seconds = Math.floor(secondsPerKm % 60);
      setMinutesForKm({ minutes, seconds });
    }
  }


  const calculateDistance = (prevCoordinates: any, newCoordinate: any) => {
    const EARTH_RADIUS = 6371;

    if (prevCoordinates.length < 1 || !prevCoordinates || !newCoordinate) {
      return;
    }

    const latestCoord = newCoordinate;
    const secondLatestCoord = prevCoordinates[prevCoordinates.length - 1];

    const lat1 = toRadians(secondLatestCoord.lat);
    const lon1 = toRadians(secondLatestCoord.lng);
    const lat2 = toRadians(latestCoord.lat);
    const lon2 = toRadians(latestCoord.lng);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = EARTH_RADIUS * c;
    const newTotalDistance = totalDistance + distance;

    setTotalDistance(newTotalDistance);
    return newTotalDistance;
  };

  const toRadians = (degrees: any) => {
    return degrees * (Math.PI / 180);
  }

  const formatTime = (time: any) => {
    return time < 10 ? `0${time}` : `${time}`;
  };

  const handleDismiss = () => {
    setStartingPoint(null)
    setRouteCoordinates([])
    setTime({ hours: 0, minutes: 0, seconds: 0 })
    setMinutesForKm({ minutes: 0, seconds: 0 })
    setTotalDistance(0)
    setAveragePace(0)
    setFinalRegion(null)
    setRunFinished(false)
  }

  const handleSave = () => {

    const objectToStore = {
      date: getCurrentDate(),
      routeCoordinates: routeCoordinates,
      region: finalRegion,
      distance: totalDistance.toFixed(2),
      time: time,
      averagePace: averagePace,
      minutesForKm: minutesForKm
    }
    storeItem(objectToStore)
    handleDismiss()
  }

  const storeItem = async (value: any) => {
    try {
      const key = new Date().getTime().toString();
      const jsonValue = JSON.stringify(value)
      await Preferences.set({
        key: key,
        value: jsonValue
      })
    } catch (e) {
      console.log(e);
    }
  }

  const getCurrentDate = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
    return formattedDate
  }

  if (!isLoaded || !endPoint) {
    return <div>
      Loading...
    </div>
  }

  return (
    <>
      <div style={{ position: 'relative', height: '80vh' }}>
        <div className='data-container'>
          <div className='data-row'>
            <div className='data-item'>
              <p style={{
                fontWeight: 'bold',
                fontSize: 28,
                margin: 0
              }}>{formatTime(time.hours)}:{formatTime(time.minutes)}:{formatTime(time.seconds)}</p>
              <p style={{
                fontSize: 16,
                color: 'grey',
                margin: 0
              }}>Time</p>
            </div>
            <div className='data-item'>
              <p style={{
                fontWeight: 'bold',
                fontSize: 28,
                margin: 0
              }}>{totalDistance.toFixed(2)} km</p>
              <p style={{
                fontSize: 16,
                color: 'grey',
                margin: 0
              }}>Distance</p>
            </div>
          </div>
          <div className='data-row'>
            <div className='data-item'>
              <p style={{
                fontWeight: 'bold',
                fontSize: 28,
                margin: 0
              }}>{averagePace} km/h</p>
              <p style={{
                fontSize: 16,
                color: 'grey',
                margin: 0
              }}>Average Pace</p>
            </div>
            <div className='data-item'>
              <p style={{
                fontWeight: 'bold',
                fontSize: 28,
                margin: 0
              }}>{formatTime(minutesForKm.minutes)}:{formatTime(minutesForKm.seconds)}</p>
              <p style={{
                fontSize: 16,
                color: 'grey',
                margin: 0
              }}>Minutes for Km</p>
            </div>
          </div>
        </div>
        <GoogleMap
          mapContainerStyle={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
          center={{
            lat: finalRegion ? finalRegion.lat : endPoint?.latitude,
            lng: finalRegion ? finalRegion.lng : endPoint?.longitude
          }}
          zoom={finalRegion ? finalRegion.z : 16}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: false,
            gestureHandling: 'none'
          }}
          onLoad={map => setMap(map)}
        >
          {isTracking && (
            <>
              <Circle
                center={{
                  lat: startingPoint?.latitude,
                  lng: startingPoint?.longitude
                }}
                radius={10}
                options={{
                  fillColor: "#20961e",
                  strokeWeight: 3,
                  strokeColor: "rgba(255, 255, 255, 1)",
                  zIndex: 2
                }}
              />
              <Circle
                center={{
                  lat: endPoint?.latitude,
                  lng: endPoint?.longitude
                }}
                radius={10}
                options={{
                  fillColor: "#f21b1e",
                  strokeWeight: 3,
                  strokeColor: "rgba(255, 255, 255, 1)",
                  zIndex: 2
                }}
              />
            </>
          )}
          <Polyline
            path={routeCoordinates}
            options={{
              strokeColor: "#72f705",
              strokeWeight: 6,
              zIndex: 1
            }}
          />
        </GoogleMap>

        {!runFinished && (
          !isTracking ? (
            <button
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '15px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(#5ecc0a, #a1fc03, #e7eb05)',
                color: 'black',
                fontWeight: 'bold',
              }}
              onClick={startTrackingRoute}
            >
              Starti
            </button>
          ) : (
            <button
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '15px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(#85030d, #a80212, #fc4b05)',
                color: 'white',
                fontWeight: 'bold',
              }}
              onClick={stopTrackingRoute}
            >
              Stop
            </button>
          )
        )}
        {runFinished && (
          <div style={{
            position: 'absolute',
            bottom: 30,
            alignItems: 'center',
            alignSelf: 'center',
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
            <button className='save-button' onClick={handleSave}>
              Save
            </button>
            <button className='save-button' onClick={handleDismiss}>
              Dismiss
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default RunningScreen;