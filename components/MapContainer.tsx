"use client"

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import CustomMarker from './CustomMarker';
import { GoPencil } from 'react-icons/go';
import { MdClear } from 'react-icons/md';
import { useRouter, useSearchParams } from 'next/navigation';
import { Helpers } from '@/_lib/helpers';
import { grayMapStyle } from '@/_lib/data';
import { showPageLoader } from '@/app/(user-end)/(main-layout)/GlobalRedux/app/appSlice';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { FaTimes } from 'react-icons/fa';

const helper = new Helpers();
const containerStyle = {
    width: '100%',
    height: '100%',
};

const center = {
    lat: 42.3360525,
    lng: -71.0169759,
};

const initialMarkers = [{}];
let draw: google.maps.MapsEventListener | null = null;

function MapContainer({ zoom, setPayload, handleSearch, payload, properties, initialLoad, setInitialLoad, setPolyLists, api_key, priceWithUtil }:
    {
        zoom: number, setPayload: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>, handleSearch?: () => void,
        payload: { [key: string]: any }, properties: any[], initialLoad: boolean, priceWithUtil: string,
        setInitialLoad: React.Dispatch<React.SetStateAction<boolean>>,
        setPolyLists: React.Dispatch<React.SetStateAction<string[]>>,
        api_key: string
    }) {

    const landmarks = [
        { lat: 42.3347657, lng: -71.0760368, name: "Boston Medical Center", address: "One Boston Medical Center Pl, Boston, MA 02118" },
        { lat: 42.3357647, lng: -71.1101671, name: "Brigham Women’s Hospital", address: "75 Francis St, Boston, MA 02115" },
        { lat: 42.3374933, lng: -71.110103, name: "Boston Children’s Hospital", address: "300 Longwood Ave, Boston, MA 02115" },
        { lat: 42.3508521, lng: -71.0784711, name: "Mass General", address: "55 Fruit St, Boston, MA 02114" },
        { lat: 42.3747905, lng: -71.1055732, name: "CHA Cambridge Hospital", address: "1493 Cambridge St, Cambridge, MA 02139" },
        { lat: 42.3740577, lng: -71.1351835, name: "Mount Auburn Hospital", address: "330 Mt Auburn St, Cambridge, MA 02138" },
    ]

    const router = useRouter();
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const [mapCenter, setMapCenter] = useState(center);
    const mapRef = useRef<google.maps.Map | null>(null);
    const [poly, setPoly] = useState<google.maps.Polyline | null>(null);
    const [selectedLandmark, setSelectedLandmark] = useState<any>(null);

    const [event_states, setEventsState] = useState({
        draw_poly: false,
        clear_poly: false,
        show_message: false
    });

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: api_key,
        //nonce: nonce,
    });

    const handleMapLoad = (map: google.maps.Map) => {
        mapRef.current = map;
    };

    const handleMapDrag = () => {
        if (!poly) {
            handleZoom(true);
        } else {
            console.log("Poly is active...")
        }
    };

    const handleZoom = (refresh: boolean = true) => {
        const map = mapRef.current;
        if (map && refresh) {

            const bounds = map.getBounds();
            const zoom = map.getZoom();
            if (zoom && bounds) {

                const north = bounds?.getNorthEast().lat();
                const east = bounds?.getNorthEast().lng();
                const south = bounds?.getSouthWest().lat();
                const west = bounds?.getSouthWest().lng();

                let prevPayload = { ...payload };
                prevPayload.map_bounds.north = north;
                prevPayload.map_bounds.south = south;
                prevPayload.map_bounds.east = east;
                prevPayload.map_bounds.west = west;
                prevPayload.zoom = zoom;
                setPayload(prevPayload);

                const pf = { ...prevPayload }

                let amenities = [];
                let equipments = [];
                let interior_features = [];
                let exterior_features = [];

                if (Array.isArray(pf.amenities)) {
                    amenities = pf.amenities;
                }

                if (Array.isArray(pf.equipments)) {
                    equipments = pf.equipments;
                }

                if (Array.isArray(pf.interior_features)) {
                    interior_features = pf.interior_features;
                }

                if (Array.isArray(pf.exterior_features)) {
                    exterior_features = pf.exterior_features;
                }

                dispatch(showPageLoader());
                router.push(`search?neighborhood=${pf.neighborhood}&search_by=${pf.search_by}&move_in=${moment(pf.move_in).format("YYYY-MM-DD")}&move_out=${moment(pf.move_out).format("YYYY-MM-DD")}&min_bed=${pf.min_bed}&max_bed=${pf.max_bed}&min_bath=${pf.min_bath}&max_bath=${pf.max_bath}&min_price=${pf.min_price}&max_price=${pf.max_price}&amenities=${JSON.stringify(amenities)}&equipments=${JSON.stringify(equipments)}&exterior_features=${JSON.stringify(exterior_features)}&interior_features=${JSON.stringify(interior_features)}&map_bounds=${JSON.stringify(pf.map_bounds)}&sort_by=${pf.sort_by}&mobile_view=${pf.mobile_view}&zoom=${pf.zoom}&version=${moment().unix() * 100}&page=1`);

            }
        }
    }


    const handleDrawPoly = async () => {

        await disable();
        setPoly(null);

        if (poly && poly != null) {
            poly.setMap(null);
        }

        const map = mapRef.current;
        if (map && !draw) {
            draw = google.maps.event.addListenerOnce(map, 'mousedown', function () {
                drawFreeHand();
            });
        }

    }

    const drawFreeHand = () => {

        const map = mapRef.current;
        if (map) {

            let map_poly = new google.maps.Polyline({ map: map, clickable: false });
            let path = map_poly.getPath();

            let move = google.maps.event.addListener(map, 'mousemove', function (e: any) {
                path.push(e.latLng);
            });

            google.maps.event.addListenerOnce(map, 'mouseup', function () {
                google.maps.event.removeListener(move);
                map_poly.setMap(null);

                // Create a copy of the path for the polygon
                let polygonPath = Array.from(path.getArray());

                // Calculate the area of the polygon
                let area = google.maps.geometry.spherical.computeArea(polygonPath);
                let tolerance = parseInt(area.toString()) / 1700000;
                if (tolerance < 6000) {
                    if (zoom <= 9) {
                        tolerance = 2500;
                    } else {
                        if (zoom == 10) {
                            tolerance = 1500;
                        } else if (zoom == 11) {
                            tolerance = 1000;
                        } else if (zoom == 12) {
                            tolerance = 750;
                        } else {
                            tolerance = 500;
                        }
                    }
                }
                console.log("tolerance:", tolerance, "zoom:", zoom)

                // Simplify the polygon path
                polygonPath = simplifyPath(polygonPath, tolerance); // Adjust the tolerance as needed

                var polygon = new google.maps.Polygon({
                    map: map,
                    paths: polygonPath,
                    strokeWeight: 2,
                });
                setPoly(polygon);

                var polyList = polygonPath.map((latLng) => latLng.toUrlValue(5));

                enable();
                setPolyLists(polyList);
            });

        }

    }

    const simplifyPath = (path: google.maps.LatLng[], tolerance: number) => {

        if (path.length <= 2) {
            return path;
        }

        let simplifiedPath = [path[0]];
        let lastPoint = path[0];

        for (let i = 1; i < path.length - 1; i++) {
            if (google.maps.geometry.spherical.computeDistanceBetween(path[i], lastPoint) >= tolerance) {
                simplifiedPath.push(path[i]);
                lastPoint = path[i];
            }
        }

        simplifiedPath.push(path[path.length - 1]);
        console.log("simplifiedPath:", simplifiedPath)
        return simplifiedPath;
    }

    const handleClearBoundary = () => {

        if (poly) {
            poly.setMap(null);
        }
        setPoly(null);
        draw = null;
        setPolyLists([]);

        setEventsState({
            draw_poly: true,
            clear_poly: false,
            show_message: false,
        });

        handleZoom(true);

    }

    const disable = async () => {
        const map = mapRef.current;
        if (map) {
            map.setOptions({
                draggable: false,
                zoomControl: false,
                scrollwheel: false,
                disableDoubleClickZoom: false
            });
            google.maps.event.clearListeners(map, 'dragend');

            const new_state = { ...event_states };
            new_state.draw_poly = false;
            new_state.clear_poly = true;
            new_state.show_message = true;
            setEventsState(new_state);
            console.log("new_state:", new_state)
        }
    }

    function enable() {
        const map = mapRef.current;
        if (map) {
            map.setOptions({
                draggable: true,
                zoomControl: true,
                scrollwheel: true,
                disableDoubleClickZoom: true
            });
            setTimeout(function () { google.maps.event.addListener(map, 'dragend', getCoordinates); }, 3000);

            setEventsState({
                draw_poly: false,
                clear_poly: true,
                show_message: false
            });
        }
    }

    function getCoordinates() {

        /**
        if (poly && poly != null) {
            console.log("There is poly")
        } else {

            if (speedTest.markerClusterer) {
                speedTest.markerClusterer.clearMarkers();
            }
            //var cordinates = speedTest.map.getBounds();
            //console.log('Cordinates: '+cordinates);
            aNord = speedTest.map.getBounds().getNorthEast().lat();
            aEst = speedTest.map.getBounds().getNorthEast().lng();
            aSud = speedTest.map.getBounds().getSouthWest().lat();
            aOvest = speedTest.map.getBounds().getSouthWest().lng();

            //alert(aNord+' @ '+aEst+' @ '+aSud+' @ '+aOvest)
            //alert(NELat+' @ '+NELng+' @ '+SWLat+' @ '+SWLng)

            loadPptyInThisArea(aNord, aEst, aSud, aOvest, speedTest.map);

        }
        **/
    }

    const geocodeAddress = (address: string) => {

        const geocoder = new google.maps.Geocoder();
        console.log("address", address)
        geocoder.geocode({ address: address }, (results, status) => {
            if (results && status === 'OK') {
                const this_loc = results[0].geometry.location;
                console.log("this_loc", this_loc)
                setMapCenter({
                    lat: this_loc.lat(),
                    lng: this_loc.lng(),
                });

                //setInitialLoad(false);
            } else {
                console.error('Geocode was not successful for the following reason: ' + status);
            }
        });
    };

    // Close InfoWindow on click outside
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (selectedLandmark && !event.target.closest('.info-window')) {
                setSelectedLandmark(null);
            }
        };

        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [selectedLandmark]);

    useEffect(() => {
        const neighborhood = searchParams?.get("neighborhood");
        if (isLoaded && neighborhood != "" && neighborhood != "All Neighborhoods") {// && initialLoad
            geocodeAddress(`${neighborhood}, MA, USA`);
        }
    }, [searchParams?.get("neighborhood"), isLoaded]); //properties //initialLoad

    useEffect(() => {
        console.log("mapCenter:", mapCenter, "initialLoad:", initialLoad)
        //handleZoom(false);
    }, [mapCenter]);

    if (!isLoaded) return <div className='w-full h-full flex justify-center items-center'>
        <AiOutlineLoading3Quarters size={35} className='animate-spin' />
    </div>;

    const mapOptions = {
        fullscreenControl: false,
        mapTypeControl: false, // Remove other controls if needed
        streetViewControl: false,
        zoomControl: true,
        styles: grayMapStyle,
    };

    const groupedData: any[] = [];
    const visitedCoordinates = new Map<string, number>();

    properties.forEach((prop) => {
        const key = `${prop.latitude},${prop.longitude}`;
        const count = visitedCoordinates.get(key) || 0;
        visitedCoordinates.set(key, count + 1);
    });

    properties.forEach((prop) => {

        const key = `${prop.latitude},${prop.longitude}`;
        const index = groupedData.findIndex((item) => item.latitude === prop.latitude && item.longitude === prop.longitude);
        const all_clust = properties.filter((item) => item.latitude === prop.latitude && item.longitude === prop.longitude);

        if (visitedCoordinates.get(key) === 1) {
            groupedData.push({ ...prop, clustered: false });
        } else {
            if (index !== -1) {
                groupedData[index] = { ...groupedData[index], clustered: true, num_of_clusters: visitedCoordinates.get(key), clustered_rops: all_clust };
            } else {
                groupedData.push({ ...prop, clustered: true, num_of_clusters: visitedCoordinates.get(key), clustered_rops: all_clust });
            }
        }
    });


    return (isLoaded && api_key != "") ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={zoom}
            onLoad={handleMapLoad}
            onDragEnd={handleMapDrag}
            onZoomChanged={handleZoom}
            options={mapOptions}>

            {
                event_states.draw_poly && (<button className={`bg-white border absolute z-10 top-[10px] right-2 h-[40px] border-primary text-primary py-2 px-4 flex 
                items-center justify-center`} onClick={handleDrawPoly}>
                    <GoPencil size={14} className='mr-1' /> <span className="">Draw</span>
                </button>)
            }

            {
                event_states.clear_poly && (<button className={`bg-white border absolute z-[9] top-[10px] right-2 h-[40px] border-primary text-primary py-2 px-4 flex 
                items-center justify-center`} onClick={handleClearBoundary}>
                    <MdClear size={14} className='mr-1' /> <span className="hddn_map_txt">Clear Boundary</span>
                </button>)
            }

            {
                event_states.show_message && (<div className='w-full bg-black/50 text-white absolute z-[8] top-0 py-5 px-3 font-normal'>
                    Draw a shape around the region you would like to live in
                </div>)
            }

            {landmarks.map((landmark, index) => (
                <Marker
                    key={index}
                    position={{ lat: landmark.lat, lng: landmark.lng }}
                    icon={{
                        url: "/medical.png",
                        scaledSize: new window.google.maps.Size(30, 30), // Adjust the size of the icon
                    }}
                    title={landmark.name}
                    onClick={() => setSelectedLandmark(landmark)} // Set the selected landmark when clicked
                />
            ))}

            {selectedLandmark && (
                <InfoWindow
                    position={{ lat: selectedLandmark.lat, lng: selectedLandmark.lng }}
                    onCloseClick={() => setSelectedLandmark(null)}>
                    <div className='py-3 px-3 flex flex-col relative'>
                        <button className="absolute top-0 right-0 p-1 text-gray-600 hover:text-gray-900 cursor-pointer"
                            onClick={() => setSelectedLandmark(null)}>
                            <FaTimes size={15} />
                        </button>
                        <h3 className='mb-2 font-medium'>{selectedLandmark.name}</h3>
                        <p>{selectedLandmark.address}</p>
                    </div>
                </InfoWindow>
            )}

            {groupedData.length && groupedData.map((prop) => (
                <CustomMarker prop={prop} zoom_level={zoom} priceWithUtil={priceWithUtil} />
            ))}

        </GoogleMap>
    ) : <div className='w-full h-full flex justify-center items-center'>
        <AiOutlineLoading3Quarters size={35} className='animate-spin' />
    </div>
}

export default MapContainer;
