import React, { useContext } from 'react';
import { View, StyleSheet, Text, Platform, ScrollView, SafeAreaView, Dimensions, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Header, LargeButton, PrimaryButton, Input, Accordian } from '../Common';
import { Colors, Typography } from '_styles';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { camera, marker, marker_png, active_marker } from '../../assets/index'
import { addCoordinates, getInventory } from '../../Actions';
import { useNavigation } from '@react-navigation/native';
import { store } from '../../Actions/store';
import Ionicons from 'react-native-vector-icons/Ionicons'
import Geolocation from '@react-native-community/geolocation';
import { MAPBOXGL_ACCCESS_TOKEN } from 'react-native-dotenv'


MapboxGL.setAccessToken(MAPBOXGL_ACCCESS_TOKEN);

const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const IS_ANDROID = Platform.OS == 'android';

class MapMarking extends React.Component {
    state = {
        centerCoordinates: [0, 0],
        activePolygonIndex: 0,
        loader: false,
        locateTree: '',
        geoJSON: {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'properties': {
                        'isPolygonComplete': false
                    },
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': [
                        ]
                    }
                }
            ]
        }
    }


    async  UNSAFE_componentWillMount() {
        if (IS_ANDROID) {
            MapboxGL.setTelemetryEnabled(false);
            await MapboxGL.requestAndroidLocationPermissions().then(() => {

            });
        }

    }

    componentDidMount() {
        this.initialState()
    }

    initialState = () => {
        const { inventoryID } = this.props;
        getInventory({ inventoryID: inventoryID }).then((inventory) => {
            inventory.species = Object.values(inventory.species);
            inventory.polygons = Object.values(inventory.polygons);
            if (inventory.polygons.length > 0) {
                let featureList = inventory.polygons.map((onePolygon) => {
                    return {
                        'type': 'Feature',
                        'properties': {
                            'isPolygonComplete': onePolygon.isPolygonComplete
                        },
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': Object.values(onePolygon.coordinates).map(oneCoordinate => ([oneCoordinate.longitude, oneCoordinate.latitude]))
                        }
                    }
                })
                let geoJSON = {
                    'type': 'FeatureCollection',
                    'features': featureList
                }
                this.setState({ geoJSON: geoJSON, locateTree: inventory.locate_tree })
            } else {
                this.setState({ locateTree: inventory.locate_tree })
            }
        })
    }

    onUpdateUserLocation = (location) => {
        if (!location) {
            alert('Unable to retrive location')
            return;
        }
        if (!this.state.isInitial) {
            const currentCoords = [location.coords.longitude, location.coords.latitude]
            this.setState({ centerCoordinates: currentCoords, isInitial: true }, () => {
                // this.addMarker()
            })
            this._camera.setCamera({
                centerCoordinate: currentCoords,
                zoomLevel: 18,
                animationDuration: 2000,
            })
        }
    }

    addMarker = async (complete) => {
        let { centerCoordinates, geoJSON, activePolygonIndex } = this.state;
        if (this.state.locateTree == 'on-site') {
            // Check distance 
            try {
                Geolocation.getCurrentPosition(position => {
                    alert(JSON.stringify(position))
                    let currentCoords = position.coords;
                    let markerCoords = centerCoordinates;

                    let isValidMarkers = true
                    geoJSON.features[activePolygonIndex].geometry.coordinates.map(oneMarker => {
                        let distance = this.distanceCalculator(markerCoords[1], markerCoords[0], oneMarker[1], oneMarker[0], 'K')
                        let distanceInMeters = distance * 1000;
                        if (distanceInMeters < 2)
                            isValidMarkers = false
                    })

                    let distance = this.distanceCalculator(currentCoords.latitude, currentCoords.longitude, markerCoords[1], centerCoordinates[0], 'K');
                    let distanceInMeters = distance * 1000;

                    if (!isValidMarkers) {
                        alert('Markers are too closed.')
                    } else if (distanceInMeters < 100) {
                        this.pushMaker(complete)
                    } else {
                        alert(`You are very far from your current location.`)
                    }
                }, (err) => alert(err.message));
            } catch (err) {
                alert('console 3')

                alert(JSON.stringify(err))
            }
        } else {
            this.pushMaker(complete)
        }
    }

    pushMaker = (complete) => {
        let { geoJSON, activePolygonIndex, centerCoordinates, locateTree } = this.state;
        geoJSON.features[activePolygonIndex].geometry.coordinates.push(centerCoordinates);
        if (complete) {
            geoJSON.features[activePolygonIndex].properties.isPolygonComplete = true;
            geoJSON.features[activePolygonIndex].geometry.coordinates.push(geoJSON.features[activePolygonIndex].geometry.coordinates[0])
        }
        this.setState({ geoJSON }, () => {
            // change the state
            const { inventoryID } = this.props;
            const { geoJSON } = this.state;
            let data = { inventory_id: inventoryID, geoJSON: geoJSON };
            addCoordinates(data).then(() => {
                if (locateTree == 'on-site') {
                    let location = ALPHABETS[geoJSON.features[activePolygonIndex].geometry.coordinates.length - (complete) ? 2 : 1]
                    this.props.toggleState(location)
                } else {
                    // For off site
                    if (complete) {
                        this.props.navigation.navigate('InventoryOverview')
                    }
                }
            })
        })
    }

    distanceCalculator = (lat1, lon1, lat2, lon2, unit) => {
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit == 'K') { dist = dist * 1.609344 }
            if (unit == 'N') { dist = dist * 0.8684 }
            return dist;
        }
    }

    onChangeRegionStart = () => this.setState({ loader: true })

    onChangeRegionComplete = async () => {
        const center = await this._map.getCenter();
        this.setState({ centerCoordinates: center, loader: false })
    }

    renderFakeMarker = (location) => {
        return (
            <View style={styles.fakeMarkerCont} >
                <Image source={active_marker} style={styles.markerImage} />
                {this.state.loader ? <ActivityIndicator color={'#fff'} style={styles.loader} /> : <Text style={styles.activeMarkerLocation}>{location}</Text>}
            </View>)
    }

    renderMapView = (geoJSON) => {
        const { activePolygonIndex } = this.state
        let shouldRenderShap = geoJSON.features[activePolygonIndex].geometry.coordinates.length > 1
        return (<MapboxGL.MapView
            showUserLocation={true}
            style={styles.container}
            ref={(ref) => this._map = ref}
            onRegionWillChange={this.onChangeRegionStart}
            onRegionDidChange={this.onChangeRegionComplete}>
            <MapboxGL.Camera ref={(ref) => (this._camera = ref)} />
            {shouldRenderShap && <MapboxGL.ShapeSource id={'polygon'} shape={geoJSON}>
                <MapboxGL.LineLayer id={'polyline'} style={polyline} />
            </MapboxGL.ShapeSource>}
            <MapboxGL.UserLocation showsUserHeadingIndicator onUpdate={this.onUpdateUserLocation} />
            {this.renderMarkers(geoJSON)}
        </MapboxGL.MapView>)
    }

    renderMarkers = () => {
        const { geoJSON } = this.state;
        const markers = [];
        for (let i = 0; i < geoJSON.features.length; i++) {
            let onePolygon = geoJSON.features[i];
            let coordinatesLenghtShouldBe = onePolygon.properties.isPolygonComplete ? onePolygon.geometry.coordinates.length - 1 : onePolygon.geometry.coordinates.length
            for (let j = 0; j < onePolygon.geometry.coordinates.length; j++) {
                let oneMarker = onePolygon.geometry.coordinates[j]
                markers.push(<MapboxGL.PointAnnotation key={`${i}${j}`} id={`${i}${j}`} coordinate={oneMarker}></MapboxGL.PointAnnotation>);
            }
        }
        return markers;
    }

    onPressCompletePolygon = async () => {
        const { navigation, inventoryID, setIsCompletePolygon } = this.props;
        const { geoJSON } = this.state;
        await this.addMarker(true)
        // 
        let data = { inventory_id: inventoryID, geoJSON: geoJSON };
        setIsCompletePolygon(true)
    }

    renderMyLocationIcon = (isShowCompletePolygonBtn) => {
        return <TouchableOpacity onPress={this.onPressMyLocationIcon} style={[styles.myLocationIcon, { bottom: isShowCompletePolygonBtn ? 160 : 90, }]}>
            <Ionicons name={'md-locate'} size={22} />
        </TouchableOpacity>
    }

    onPressMyLocationIcon = () => {
        Geolocation.getCurrentPosition(position => {
            this.setState({ isInitial: false }, () => this.onUpdateUserLocation(position))
        }, (err) => alert(err.message));

    }

    render() {
        const { geoJSON, loader, activePolygonIndex } = this.state;
        let isShowCompletePolygonBtn = geoJSON.features[activePolygonIndex].geometry.coordinates.length > 1;
        let coordinatesLenghtShouldBe = (geoJSON.features[activePolygonIndex].properties.isPolygonComplete) ? geoJSON.features[activePolygonIndex].geometry.coordinates.length - 1 : geoJSON.features[activePolygonIndex].geometry.coordinates.length
        let location = ALPHABETS[geoJSON.features[activePolygonIndex].geometry.coordinates.length]
        return (
            <View style={styles.container} fourceInset={{ top: 'always' }}>
                <SafeAreaView />
                <View style={styles.headerCont}>
                    <Header headingText={`Location ${location}`} subHeadingText={'Please visit first corner of the plantation and select your location'} />
                </View>
                <View style={styles.container}>
                    {this.renderMapView(geoJSON)}
                    {this.renderFakeMarker(location)}
                </View>
                <View>
                    {this.renderMyLocationIcon(isShowCompletePolygonBtn)}
                    {isShowCompletePolygonBtn && <View style={styles.completePolygonBtnCont}>
                        <PrimaryButton disabled={loader} theme={'white'} onPress={this.onPressCompletePolygon} btnText={'Select & Complete Polygon'} style={{ width: '90%', }} />
                    </View>}
                    <View style={styles.continueBtnCont}>
                        <PrimaryButton disabled={loader} onPress={() => this.addMarker()} btnText={'Select location & Continue'} style={{ width: '90%', }} />
                    </View>
                </View>

            </View>)
    }
}

export default function (props) {
    const navigation = useNavigation();
    const globalState = useContext(store);
    const { state } = globalState;
    return <MapMarking {...props} {...state} navigation={navigation} />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.WHITE
    },
    continueBtnCont: {
        flexDirection: 'row', position: 'absolute', bottom: 10, backgroundColor: 'transparent', width: '100%', justifyContent: 'center',
    },
    completePolygonBtnCont: {
        flexDirection: 'row', position: 'absolute', bottom: 80, backgroundColor: 'transparent', width: '100%', justifyContent: 'center',
    },
    headerCont: {
        marginHorizontal: 25
    },
    fakeMarkerCont: {
        position: 'absolute', left: '50%', top: '50%', justifyContent: 'center', alignItems: 'center'
    },
    markerImage: {
        position: 'absolute',
        resizeMode: 'contain',
        bottom: 0
    },
    loader: {
        position: 'absolute', bottom: 67
    },
    activeMarkerLocation: {
        position: 'absolute', bottom: 67, color: '#fff', fontWeight: 'bold', fontSize: 16
    },
    myLocationIcon: {
        width: 45, height: 45, backgroundColor: '#fff', position: 'absolute', borderRadius: 100, right: 0, marginHorizontal: 25, justifyContent: 'center', alignItems: 'center', borderColor: Colors.TEXT_COLOR
    }
})

const polyline = { lineColor: 'red', lineWidth: 2, lineColor: '#000' }