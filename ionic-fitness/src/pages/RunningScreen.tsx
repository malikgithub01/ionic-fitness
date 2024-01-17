import { GoogleMap, Polyline, Circle } from '@capacitor/google-maps';
import { useRef, useState, useEffect } from 'react';

const RunningScreen: React.FC = () => {
  const mapRef = useRef<HTMLElement>();
  let newMap: GoogleMap;
  const [map, setMap] = useState<GoogleMap | null>()
  const [startPointId, setStartPointId] = useState<any>()
  const [endPointId, setEndPointId] = useState<any>()
  const [polylineId, setPolylineId] = useState<any>()

  useEffect(() => {
    async function createMap() {
      if (!mapRef.current) return;

      newMap = await GoogleMap.create({
        id: 'my-cool-map',
        element: mapRef.current,
        apiKey: "AIzaSyB_rtBdR-f5M-inMs6EIY0iGd5Fmt9EvFs",
        forceCreate: true,
        config: {
          center: {
            lat: 52.5025,
            lng: 13.4101
          },
          zoom: 15
        }
      })
      setMap(newMap)
    }
    createMap()
  }, []);

  const createCircles = async () => {
    const results = await map?.addCircles([
      {
        center: { lat: 52.5025, lng: 13.4101 },
        radius: 10,
        fillColor: "#20961e",
        strokeColor: 'grey',
        strokeWeight: 3
      },
      {
        center: { lat: 52.5030, lng: 13.4110 },
        radius: 10,
        fillColor: "red",
        strokeColor: 'grey',
        strokeWeight: 3
      }
    ])
    setEndPointId(results![1])
  }

  const updateEndPoint = async () => {
    removeCircle(endPointId)
    await map?.addCircles([
      {
        center: { lat: 52.5035, lng: 13.4115 },
        radius: 10,
        fillColor: "red",
        strokeColor: 'grey',
        strokeWeight: 3
      }
    ])
  }

  const removeCircle = async (circleId: string) => {
    await map?.removeCircles([circleId])
  }

  const addPolyline = async () => {
    const polyline: Polyline[] =
      [
        {
          path: [
            { lat: 52.5025, lng: 13.4101 },
            { lat: 52.5030, lng: 13.4110 },
          ],
          strokeColor: '#AA00FF',
          strokeWeight: 4
        }
      ]

    const result = await map?.addPolylines(polyline)
    setPolylineId(result![0])
  }

  const addPolyline2 = async () => {
    await map?.removePolylines([polylineId])
    const polyline: Polyline[] =
      [
        {
          path: [
            { lat: 52.5025, lng: 13.4101 },
            { lat: 52.5030, lng: 13.4110 },
            { lat: 52.5035, lng: 13.4115 },
          ],
          strokeColor: '#AA00FF',
          strokeWeight: 4
        }
      ]
    await map?.addPolylines(polyline)
  }

  const clearMap = async () => {
      await map?.removePolylines([polylineId])
      await map?.removeCircles([startPointId, endPointId])
  }

  return (
    <>
      <capacitor-google-map ref={mapRef} style={{
        display: 'inline-block',
        width: "100vw",
        height: "50vh",
      }}></capacitor-google-map>

      <button onClick={createCircles}>   CIRCLE   </button>
      <button onClick={updateEndPoint}>   circle </button>

      <button onClick={addPolyline}>   POLYLINE  </button>
      <button onClick={addPolyline2}>   polyline  </button>
      <button onClick={addPolyline2}>   CLEAR MAP  </button>


      <p>{endPointId}</p>
      <p>{polylineId}</p>
    </>

  )
}

export default RunningScreen;