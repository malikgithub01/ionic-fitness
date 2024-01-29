import { IonCard, IonCardContent, IonContent } from '@ionic/react';
import { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap, Circle, Polyline } from '@react-google-maps/api';
import './RunningMapCard.css'


const RunningMapCard: React.FC<any> = ({ date, region, routeCoordinates, distance, time }) => {

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyATpg24pvyAd5226-9H8m4np4lDI0Fn0o4"
    })

    if (!isLoaded) {
        return <div>
            Loading...
        </div>
    }
    const formatTime = (time: any) => {
        return time < 10 ? `${time}` : `${time}`;
    };

    return (
        <div className='card-container'>
            <p className='date-text'>{date}</p>
            <IonCard>
                <GoogleMap
                    mapContainerStyle={{
                        minHeight: '200px'
                    }}
                    center={{
                        lat: region.lat,
                        lng: region.lng
                    }}
                    zoom={region.zoom}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        zoomControl: false,
                        gestureHandling: 'none'
                    }}
                >
                    <Polyline
                        path={routeCoordinates}
                        options={{
                            strokeColor: "#72f705",
                            strokeWeight: 6,
                            zIndex: 1
                        }}
                    />

                </GoogleMap>
                <div className='card-content'>
                    <p className='distance-text'>{distance} km</p>
                    <p className='time-text'>{time.hours > 0 && `${formatTime(time.hours)}h`}
                        {formatTime(time.minutes)}m {formatTime(time.seconds)}s</p>
                </div>
            </IonCard>
        </div>
    )
}

export default RunningMapCard