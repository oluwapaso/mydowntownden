"use client";

import useCurrentBreakpoint from "@/_hooks/useMediaQuery";
import { Helpers } from "@/_lib/helpers";
import FilterBox from "@/components/FilterBox";
import NavBar from "@/components/NavBar";
import SearchPageSearchBox from "@/components/SearchPageSearchBox";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BiAnalyse, BiSearch } from "react-icons/bi";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import 'react-toastify/dist/ReactToastify.css';
import { hidePageLoader, showPageLoader } from "../GlobalRedux/app/appSlice";
import { useDispatch } from "react-redux";
import { APIResponseProps } from "@/components/types";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Pagination from "@/components/pagination";
import UserPropertyCard from "@/components/UserPropertyCard";
import MapContainer from "@/components/MapContainer";

const helper = new Helpers();
export default function SearchPage() {

  const { is1Xm, is2Xm, isXs, isSm, isMd, isTab } = useCurrentBreakpoint();
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const user = session?.user as any;
  const searchParams = useSearchParams();
  const curr_page = parseInt(searchParams?.get("page") as string) || 1;
  const page_size = 16;

  let mobile_view = "Map";
  if (is1Xm || is2Xm || isXs || isSm || isMd) {
    mobile_view = "List";
  }
  const [mobileView, setMobileView] = useState(mobile_view);

  //ne=42.60242525588096,-70.73319879101562&sw=42.171848287543746,-71.38688531445312
  const init_payload = {
    search_by: "Map",
    neighborhood: searchParams?.get("neighborhood") || "",
    min_price: 1500,
    max_price: 10000,
    min_bed: 0,
    max_bed: 0,
    min_bath: 0,
    max_bath: 0,
    min_square_feet: 0,
    max_square_feet: 0,
    move_in: searchParams?.get("move_in") || moment(moment().add(1, "day")).format("YYYY-MM-DD"),
    move_out: searchParams?.get("move_out") || moment(moment().add(32, "days")).format("YYYY-MM-DD"),
    map_bounds: { north: 42.60242525588096, south: 42.171848287543746, east: -70.73319879101562, west: -71.38688531445312 },
    zoom: 13,
    page: curr_page,
    limit: page_size,
    sort_by: "Price-DESC",
    mobile_view: mobileView,
    version: moment().unix() * 100,
  }

  const BoxStates = {
    "price_shown": false,
    "search_shown": false,
    "filters_shown": false,
    "sort_shown": false,
  }

  const [box_state, setBoxStates] = useState<{ [key: string]: boolean }>(BoxStates);
  const [payload, setPayload] = useState<{ [key: string]: any }>(init_payload);
  const [initialLoad, setInitialLoad] = useState(true);
  const [abortController, setAbortController] = useState(new AbortController());
  const [mapSrchController, setMapSrchController] = useState(new AbortController());
  const [total_record, setTotalRecord] = useState(0);
  const [total_page, setTotalPage] = useState(0);
  const [total_filters, setTotalFilters] = useState(0);
  const [url_path, setUrlPath] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [prop_lists, setPropLists] = useState<any[]>([]);
  const [isPropsLoading, setIsPropsLoading] = useState(true);
  const [payloadBuilt, setPayloadBuilt] = useState(false);
  const [poly_list, setPolyLists] = useState<string[]>([]);
  const [is_loaded, setIsLoaded] = useState(false);
  const [googleMapKey, setGoogleMapKey] = useState("");
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const filtersBoxRef = useRef<HTMLDivElement>(null);
  const [priceWithUtil, setPriceWithUtil] = useState("No");

  const handleMenuBox = (menu_key: string) => {
    setBoxStates((prev_states) => {

      for (let key in prev_states) {
        if (key != menu_key) {
          prev_states[key] = false;
        }
      }

      return {
        ...prev_states,
        [menu_key]: !box_state[menu_key],
      }
    });
  }

  let filter_by = ""
  if (payload.sort_by == "Price-DESC") {
    filter_by = "Price (High)"
  } else if (payload.sort_by == "Price-ASC") {
    filter_by = "Price (Low)"
  } else if (payload.sort_by == "Date-DESC") {
    filter_by = "Newest Firsts"
  } else if (payload.sort_by == "Date-ASC") {
    filter_by = "Availability"
  } else if (payload.sort_by == "Sqft-DESC") {
    filter_by = "Size (High)"
  } else if (payload.sort_by == "Sqft-ASC") {
    filter_by = "Size (High)"
  }

  const handleSort = (sort_by: string) => {

    setPayload((prev_states) => {
      return {
        ...prev_states,
        sort_by: sort_by,
      }
    });

    setBoxStates((prev_states) => {
      return {
        ...prev_states,
        sort_shown: false,
      }
    });

    dispatch(showPageLoader());
    setInitialLoad(true);
    handleMenuBox("sort_shown"); //Closes sort box

  }

  /** Build URL **/
  useEffect(() => {

    let updatedPayload = { ...payload }; // Create a copy of the payload object
    let totalFilters = 0;

    if (searchParams?.size && searchParams?.size > 0) {
      searchParams?.forEach((val, key) => {
        if (key != "amenities" && key != "equipments" && key != "exterior_features" && key != "interior_features" && key != "map_bounds" && key != "zoom") {
          if (["min_bed", "max_bed", "min_bath", "max_bath", "min_price", "max_price"].includes(key)) {
            updatedPayload[key] = parseInt(val);
            if (parseInt(val) > 0) {
              totalFilters++;
            }
          } else if (["neighborhood", "sort_by", "move_in", "move_out", "zoom"].includes(key)) {
            updatedPayload[key] = val;
          }
        } else if ((key == "amenities" || key == "equipments" || key == "exterior_features" || key == "interior_features"
          || key == "map_bounds") && val) {
          const this_val = JSON.parse(val);
          updatedPayload[key] = this_val;
          if (key != "map_bounds" && this_val.length > 0) {
            totalFilters++;
          }
        }
      });
    } else {
      updatedPayload = { ...init_payload }
    }

    setPayload(updatedPayload);
    setTotalFilters(totalFilters);
    setPayloadBuilt(true);

    // Create a new AbortController for each effect
    const controller = new AbortController();
    setMapSrchController(controller);

    try {
      // Cancel previous API request
      if (mapSrchController) {
        mapSrchController.abort();
      }
    } catch (e: any) {
      console.log(e)
    }

    setTotalRecord(0);
    setTotalPage(0);
    setIsPropsLoading(true);
    const screen_width = window.innerWidth;

    // Split the URL at '?'
    let parts = window.location.href.split('?');
    if (parts.length > 1) {
      // Split the query parameters
      let params = parts[1].split('&');
      // Filter out the 'page' parameter
      params = params.filter(param => !param.startsWith('page='));
      // Reconstruct the URL
      const url = parts[0] + (params.length > 0 ? '?' + params.join('&') : '');
      console.log("url", url)
      setUrlPath(url);
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    fetch(`${apiBaseUrl}/api/properties/load-properties`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...updatedPayload,
        poly_list: poly_list,
        page: curr_page,
        screen_width: screen_width,
        "user_id": user?.user_id,
      }),
      signal: controller.signal, // Use the current controller's signal
    }).then((resp): Promise<APIResponseProps> => {
      setInitialLoad(false);
      dispatch(hidePageLoader());
      return resp.json();
    }).then(data => {

      if (data.success && data.data?.properties?.map_data?.length || data.data?.properties?.list_data?.length) {

        setProperties(data.data?.properties?.map_data);
        setPropLists(data.data?.properties?.list_data);

        if (data.data?.properties?.list_data?.length) {
          const total_records = data.data?.properties?.list_data[0].total_records;
          setTotalRecord(total_records);
          setTotalPage(Math.ceil(total_records / page_size));
          setIsPropsLoading(false);
          dispatch(hidePageLoader());
        } else {
          setIsPropsLoading(false);
          dispatch(hidePageLoader());
        }

      } else {
        setProperties([]);
        setPropLists([]);
        setIsPropsLoading(false);
        dispatch(hidePageLoader());
      }

    });

  }, [searchParams, searchParams?.size]);
  /** Build URL **/

  /** Getting and setting google API key, we need to set this before initializing the MAP */
  useEffect(() => {

    const Get_API_Info = async () => {
      const api_info_prms = helper.FetchAPIInfo();
      const api_info = await api_info_prms
      let google_map_key = "";
      if (api_info.success && api_info.data) {
        google_map_key = api_info.data.google_map_key;
        setGoogleMapKey(api_info.data.google_map_key);
      } else {
        throw new Error('Google map API key not found in database');
      }
    }

    if (!is_loaded) {
      Get_API_Info();
    }

  }, [is_loaded]);

  useEffect(() => {
    if (googleMapKey) {
      setIsLoaded(true);
    }
  }, [googleMapKey]);
  /** Getting and setting google API key, we need to set this before initializing the MAP */

  useEffect(() => {

    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {

        setBoxStates((prev_states) => {
          return {
            ...prev_states,
            search_shown: false,
          }
        });

      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, [searchBoxRef]);

  useEffect(() => {

    const handleClickOutside = (e: MouseEvent) => {
      if (filtersBoxRef.current && !filtersBoxRef.current.contains(e.target as Node)) {

        setBoxStates((prev_states) => {
          return {
            ...prev_states,
            filters_shown: false,
          }
        });

      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, [filtersBoxRef]);


  useEffect(() => {

    console.log("initialLoad", initialLoad)
    if (initialLoad) {

      const pf = { ...payload }

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

      //dispatch(showPageLoader());
      //handleMenuBox("filters_shown"); //closes filters
      router.push(`search?neighborhood=${pf.neighborhood}&search_by=${pf.search_by}&move_in=${pf.move_in}&move_out=${pf.move_out}&min_bed=${pf.min_bed}&max_bed=${pf.max_bed}&min_bath=${pf.max_bath}&min_price=${pf.min_price}&max_price=${pf.max_price}&amenities=${JSON.stringify(amenities)}&equipments=${JSON.stringify(equipments)}&exterior_features=${JSON.stringify(exterior_features)}&interior_features=${JSON.stringify(interior_features)}&map_bounds=${JSON.stringify(pf.map_bounds)}&sort_by=${pf.sort_by}&mobile_view=${pf.mobile_view}&version=${moment().unix() * 100}&page=1`);

      //console.log(`search?neighborhood=${pf.neighborhood}&search_by=${pf.search_by}&move_in=${pf.move_in}&move_out=${pf.move_out}&min_bed=${pf.min_bed}&max_bed=${pf.max_bed}&min_bath=${pf.max_bath}&min_price=${pf.min_price}&max_price=${pf.max_price}&amenities=${JSON.stringify(amenities)}&equipments=${JSON.stringify(equipments)}&exterior_features=${JSON.stringify(exterior_features)}&interior_features=${JSON.stringify(interior_features)}&map_bounds=${JSON.stringify(pf.map_bounds)}&sort_by=${pf.sort_by}&mobile_view=${pf.mobile_view}&version=${moment().unix() * 100}&page=1`);

    }

  }, [initialLoad]); //payload

  let overflow_filters = "";
  let mobile_filters = "";
  let page_cols = "grid-cols-5";
  let map_view_cntrl = "";
  let list_view_cntrl = "";

  if (is1Xm || is2Xm || isXs || isSm || isMd) {
    overflow_filters = "overflow-x-auto overflow-y-hidden";
    mobile_filters = "right-0 top-0";
    page_cols = "grid-cols-1";

    if (isSm || isMd) {
      mobile_filters = "right-[0] top-[135px]";
    }

    if (isMd) {
      mobile_filters = "right-[100%] translate-x-[150%] top-[135px]";
    }

    map_view_cntrl = "hidden";
    list_view_cntrl = "hidden";
    if (mobileView == "Map") {
      map_view_cntrl = "block";
    } else {
      list_view_cntrl = "block";
    }
  }

  const toggleUtilities = () => {
    setPriceWithUtil((prev_val) => {
      let new_val = "No"
      if (prev_val == "No") {
        new_val = "Yes"
      }
      return new_val
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <NavBar page="Search" />
      <section className="w-full bg-white grid grid-cols-2 pt-[92px]">
        <div className="flex flex-col py-5 px-5">
          <div className="w-full flex justify-between items-center">
            <div className="relative">
              <div className="flex items-center select-none relative">
                <div className="px-4 py-1 mr-2 cursor-pointer border border-gray-300 flex items-center rounded-2xl hover:shadow-md
                 space-x-2" onClick={() => handleMenuBox("search_shown")} >
                  <BiSearch size={16} /> <span className="font-medium">{payload.neighborhood}</span>
                  <span className="font-medium text-gray-400">|</span>
                  <span className="font-medium">
                    {moment(payload.move_in).format("DD MMM")} - {moment(payload.move_out).format("DD MMM")}
                  </span>
                </div>

                <div className="px-4 py-1 cursor-pointer border border-gray-300 flex items-center rounded-2xl hover:shadow-md relative"
                  onClick={() => handleMenuBox("filters_shown")}>
                  <BiAnalyse size={16} className='mr-1' />
                  <span className="">
                    <span>Filters</span>
                    <span className="absolute size-6 p-2 rounded-full bg-sky-700 text-white text-sm font-medium -top-3 -right-2
                     flex items-center justify-center">
                      {total_filters}
                    </span>
                  </span>
                </div>

                <div className={`absolute top-0 left-0 rounded duration-300 ransition-all z-30 ${box_state.search_shown
                  ? "p-0 min-w-full w-[45vw] h-[600px] border border-gray-500 shadow-2xl overflow-x-hidden overflow-y-auto"
                  : "w-0 min-w-0 !h-0 overflow-hidden"}`} ref={searchBoxRef}>
                  <SearchPageSearchBox payload={payload} search_shown={box_state.search_shown} handleMenuBox={handleMenuBox} />
                </div>

                <div className={`absolute top-0 left-0 rounded duration-300 ransition-all z-30 ${box_state.filters_shown
                  ? "p-0 min-w-full w-[45vw] h-[750px] border border-gray-500 shadow-2xl overflow-x-hidden overflow-y-auto"
                  : "w-0 min-w-0 !h-0 overflow-hidden"}`} ref={filtersBoxRef}>
                  <FilterBox payload={payload} handleMenuBox={handleMenuBox} filters_shown={box_state.filters_shown} />
                </div>
              </div>
            </div>

            <div className='relative z-[20]'>
              <div className='flex items-center'>
                <span className='mr-2'>Sort By:</span>
                <button onClick={() => handleMenuBox("sort_shown")} className='flex items-center text-sky-900'>
                  <span className=''>{filter_by}</span>
                  <span className={`ml-1 ${box_state.sort_shown ? "rotate-180" : null}`}>
                    <MdOutlineKeyboardArrowDown size={22} />
                  </span>
                </button>
              </div>

              <div className={`w-[250px] left-0 sm:right-0 absolute bg-transparent ${box_state.sort_shown ? "block" : "hidden"}`}>
                <div className='w-full bg-white m-0 mt-1 drop-shadow-lg rounded-lg *:cursor-pointer *:py-3 *:px-3'>
                  <div className="w-full hover:bg-gray-50" onClick={() => handleSort("Date-ASC")}>Availability</div>
                  <div className="w-full hover:bg-gray-50" onClick={() => handleSort("Price-DESC")}>Price (High)</div>
                  <div className="w-full hover:bg-gray-50" onClick={() => handleSort("Price-ASC")}>Price (Low)</div>
                  <div className="w-full hover:bg-gray-50" onClick={() => handleSort("Sqft-DESC")}>Size (High)</div>
                  <div className="w-full hover:bg-gray-50" onClick={() => handleSort("Sqft-ASC")}>Size (Low)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full mt-4">

            <div className="inline-flex items-center cursor-pointer" onClick={toggleUtilities} >
              <input type="checkbox" className="sr-only peer" checked={priceWithUtil == "Yes" ? true : false} />
              <div className="relative w-11 h-3 bg-gray-200 peer-focus:outline-none peer-focus:ring4 peer-focus:ring-blue300 
              dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full 
              rtl:peer-checked:after:translatex20 peer-checked:after:start-[10px] after:content-[''] after:absolute 
              after:-top-[4px] after:-start-[4px] after:bg-white after:border-gray-400 after:border after:rounded-full 
              after:h-5 after:w-5 after:transition-all after:shadow-md dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Show prices with utilities</span>
            </div>

            <div className='w-full mt-2 grid grid-cols-1 xs:grid-cols-2 tab:grid-cols-1 lgScrn:grid-cols-2 gap-y-4 gap-2 sm:gap-4 
            lg:gap-6 mx-auto max-w-[410px] xs:!max-w-[100%]'>
              {
                isPropsLoading && (<div className='w-full flex justify-center items-center min-h-60 sm:col-span-full'>
                  <AiOutlineLoading3Quarters size={35} className='animate-spin' />
                </div>)
              }

              {
                !isPropsLoading ?
                  prop_lists.length > 0
                    ? (prop_lists.map((prop) => <UserPropertyCard key={prop.listing_id} prop={prop} page="Map"
                      priceWithUtil={priceWithUtil} />))
                    : (<div className='w-full flex justify-center items-center min-h-60 sm:col-span-full'>
                      No results found.
                    </div>)
                  : ""
              }

              <div className='w-full mt-3 col-span-1 sm:col-span-full'>
                {total_page > 0 ? <Pagination totalPage={total_page} curr_page={curr_page} url_path={`${url_path}&`} /> : null}
              </div>
            </div>

          </div>
        </div>




        <div className="map-box h-[calc(100vh-92px)] sticky top-[92px] z-10">
          <div className={`h-full col-span-full tab:col-span-3 lg:col-span-4 lgScrn:col-span-3 ${map_view_cntrl}`}>
            {(mobileView == "Map" && googleMapKey != "") && <MapContainer zoom={payload.zoom} setPayload={setPayload} payload={payload}
              properties={properties} initialLoad={initialLoad} setInitialLoad={setInitialLoad} setPolyLists={setPolyLists}
              api_key={googleMapKey} priceWithUtil={priceWithUtil} />
            }
          </div>
        </div>
      </section>
    </main >
  );
}
