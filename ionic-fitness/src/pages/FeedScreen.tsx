import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { IonContent, IonItem, IonList } from '@ionic/react';
import RunningMapCard from '../components/RunningMapCard';

const FeedScreen: React.FC = () => {

    const [listData, setListData] = useState<any>()

    useEffect(() => {
        const fetchData = async () => {
            const { keys } = await Preferences.keys()
            const valuesPromises = keys.map(async (key: any) => {
                const { value } = await Preferences.get({ key: key })
                return JSON.parse(value!);
            })
            const values = await Promise.all(valuesPromises);
            setListData(values);
        }
        fetchData()
    }, [])

    if (!listData) {
        return <div>Loading...</div>
    }

    return (
        <IonContent>
            <IonList>
                {listData.map((item: any) => (
                    <RunningMapCard
                        date={item.date}
                        region={item.region}
                        routeCoordinates={item.routeCoordinates}
                        distance={item.distance}
                        time={item.time}
                    />
                ))}
            </IonList>
        </IonContent>
    )
}

export default FeedScreen