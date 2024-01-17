import { GoogleMap } from '@capacitor/google-maps';
import { useRef } from 'react';

const RunningScreen: React.FC = () => {
  const mapRef = useRef<HTMLElement>();
  let newMap: GoogleMap;

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
        zoom: 12
      }
    })
  }

  return (
    <>
      <capacitor-google-map ref={mapRef} style={{
        display: 'inline-block',
        width: "100vw",
        height: "80vh",
      }}></capacitor-google-map>

      <button onClick={createMap}>Create Map</button>
    </>

  )
}

export default RunningScreen;