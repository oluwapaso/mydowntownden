"use client";

import CustomLinkMain from "@/components/CustomLinkMain";
import NavBar from "@/components/NavBar";
import "react-datepicker/dist/react-datepicker.css";
import { BiSearch } from "react-icons/bi";
import { useEffect, useRef, useState } from "react";
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRange } from 'react-date-range';
import moment from "moment";
import { format } from 'date-fns';
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { APIResponseProps } from "@/components/types";
import { Helpers } from "@/_lib/helpers";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { showPageLoader } from "./(main-layout)/GlobalRedux/app/appSlice";
import Footer from "@/components/Footer";
import useCurrentBreakpoint from "@/_hooks/useMediaQuery";
import { GiDivergence } from "react-icons/gi";
import useIntersectionObserver from "@/_hooks/useIntersectionObserver";

const helpers = new Helpers();
export default function Home() {

  const router = useRouter();
  const dispatch = useDispatch();
  const currentDate = new Date();
  const divRef = useRef<HTMLDivElement>(null);
  const divRef2 = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [initialScrollY, setInitialScrollY] = useState(0);
  const [isInView2, setIsInView2] = useState(false);
  const [initialScrollY2, setInitialScrollY2] = useState(0);
  const [ref1, inView1] = useIntersectionObserver({ threshold: 0.1 });
  const [ref2, inView2] = useIntersectionObserver({ threshold: 0.1 });

  const { is1Xm, is2Xm, isXs, isSm, isMd, isTab } = useCurrentBreakpoint();
  let bg_position = '0% 0%';
  let backgroundSize = 'auto 100%';
  let calendar_dir: "vertical" | "horizontal" | undefined = "horizontal";
  if (is1Xm || is2Xm || isXs || isSm || isMd) {
    bg_position = "50% 50%";
    backgroundSize = "auto 100%";
    calendar_dir = "vertical";
  }

  // Add 1 day to the current date
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  // Add 2 years to the current date
  const futureDate = new Date();
  futureDate.setFullYear(currentDate.getFullYear() + 2);

  // Set the month to December (month index 11 since months are 0-indexed in JavaScript)
  futureDate.setMonth(11);

  // Optionally, set the day to the first day of December
  futureDate.setDate(31);

  const dfDate = new Date(currentDate);
  dfDate.setDate(currentDate.getDate() + 32);

  const defaultRange = {
    startDate: minDate,
    endDate: dfDate,
    key: 'selection'
  }

  const [dates, setDates] = useState<any>([defaultRange]);

  const [move_in, setMoveIn] = useState("");
  const [move_out, setMoveOut] = useState("");
  const [property_city, setPropertyCity] = useState("");
  const [disabled_dates, setDisabledDates] = useState<string[]>([]);
  const [range_shown, setRangeShown] = useState(false);
  const [city_box_shown, setCityBoxShown] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [cities_loaded, setCitiesLoaded] = useState(false);
  const [cities_lists, setCitiesLists] = useState<string[]>([]);
  const whereBoxRef = useRef<HTMLDivElement>(null);
  const dateBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dates && dates.length) {

      toast.dismiss();
      const date_data = dates[0];
      console.log("date_data.startDate", date_data.startDate)
      if (date_data.startDate && date_data.startDate != "") {
        setMoveIn(moment(date_data.startDate?.toString()).format("MM/DD/YYYY"));
        if (date_data.startDate?.toString() == date_data.endDate?.toString()) {

          const min_dates: string[] = [];
          const currentDate = new Date(date_data.startDate);
          for (let i = 1; i <= 30; i++) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() + i);
            min_dates.push(moment(date).format("YYYY-MM-DD"));
          }

          setDisabledDates(min_dates);

          setMoveOut("");
        } else {

          const day_string = moment(date_data.endDate).format("YYYY-MM-DD");
          if (disabled_dates.includes(day_string)) {

            toast.error("Select minimum of 31 days", {
              position: "top-center",
              theme: "colored"
            })

          } else {
            setMoveOut(moment(date_data.endDate?.toString()).format("MM/DD/YYYY"));
          }

        }
      }

    } else {
      console.log("nod startDate")
    }
  }, [dates]);

  function customDayContent(day: Date) {
    let extraDot = null;
    const day_string = moment(day).format("YYYY-MM-DD");
    //console.log("day_string", day_string);
    if (disabled_dates.includes(day_string)) {
      extraDot = (
        <div className="customDayContent"
          style={{
            height: "36px",
            width: "100%",
            borderRadius: "0px",
            background: "rgb(248, 248, 248)",
            position: "absolute",
            top: -5,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: -10,
            opacity: 1,
          }}
        />
      )
    }
    return (
      <div className={`${extraDot && "! cursor-not-allowed"}`}>
        {extraDot}
        <span className={`${extraDot && "!text-red-500"}`}>{format(day, "d")}</span>
      </div>
    )
  }

  const showDateRange = () => {
    setRangeShown(true);
    setCityBoxShown(false);
  }

  const showCityBox = () => {
    setCityBoxShown(true);
    setRangeShown(false);
    fetchCities();
  }

  const fetchCities = async () => {
    if (!cities_loaded) {
      const propPromise: Promise<APIResponseProps> = helpers.LoadCities();
      const propResp = await propPromise;

      if (propResp.success) {
        const citiesData = propResp.data;
        setCities(citiesData);
        setCitiesLists(citiesData);
        setCitiesLoaded(true);
      }
    }
  }

  const searchCity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const result = cities.filter((item) => item.toLowerCase().includes(val.toLowerCase()));
    setCitiesLists(result);
    setPropertyCity(val);
  }

  const setSelectedCity = (city: string) => {
    setCityBoxShown(false);
    setPropertyCity(city);
  }

  const searchProperties = () => {

    const lowercaseCities = cities.map(city => city.toLowerCase());

    toast.dismiss();
    if ((!property_city || !lowercaseCities.includes(property_city.toLowerCase())) && property_city.toLowerCase() != "all neighborhoods") {
      toast.error("Select a valid neighborhood from the list", {
        position: "top-center",
        theme: "colored"
      });
      return;
    }

    if ((!move_in || !move_out) || (move_in == move_out)) {
      toast.error("Select a valid date range", {
        position: "top-center",
        theme: "colored"
      });
      return;
    }

    dispatch(showPageLoader());
    router.push(`/search?neighborhood=${property_city}&move_in=${moment(move_in).format("YYYY-MM-DD")}&move_out=${moment(move_out).format("YYYY-MM-DD")}&map_bounds=${JSON.stringify({ north: 42.60242525588096, south: 42.171848287543746, east: -70.73319879101562, west: -71.38688531445312 })}`);

  }


  useEffect(() => {
    const targetDiv = divRef.current;

    const handleScroll = () => {
      if (targetDiv && isInView) {

        const currentScrollY = window.scrollY || window.pageYOffset;
        const offsetX = -(currentScrollY - initialScrollY) * 0.1; // Adjust the multiplier for speed
        const offsetY = (currentScrollY - initialScrollY) * 0.2;  // Adjust the multiplier for speed

        console.log("isInView", isInView, "currentScrollY", currentScrollY, "initialScrollY", initialScrollY)
        targetDiv.style.transform = `translate3d(${offsetX}px, 0px, 0)`;
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setInitialScrollY(window.scrollY || window.pageYOffset);
          window.addEventListener('scroll', handleScroll);
        } else {
          setIsInView(false);
          window.removeEventListener('scroll', handleScroll);
        }
      });
    }, { threshold: 0.1 });

    if (targetDiv) {
      observer.observe(targetDiv);
    }

    return () => {
      if (targetDiv) {
        observer.unobserve(targetDiv);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isInView, divRef]);


  useEffect(() => {
    const targetDiv = divRef2.current;

    const handleScroll = () => {
      if (targetDiv && isInView2) {

        const currentScrollY = window.scrollY || window.pageYOffset;
        const offsetX = (currentScrollY - initialScrollY2) * 0.1; // Adjust the multiplier for speed
        const offsetY = (currentScrollY - initialScrollY2) * 0.2;  // Adjust the multiplier for speed

        targetDiv.style.transform = `translate3d(${offsetX}px, 0px, 0)`;
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsInView2(true);
          setInitialScrollY2(window.scrollY || window.pageYOffset);
          window.addEventListener('scroll', handleScroll);
        } else {
          setIsInView2(false);
          window.removeEventListener('scroll', handleScroll);
        }
      });
    }, { threshold: 0.1 });

    if (targetDiv) {
      observer.observe(targetDiv);
    }

    return () => {
      if (targetDiv) {
        observer.unobserve(targetDiv);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isInView2, divRef2]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (whereBoxRef.current && !whereBoxRef.current.contains(e.target as Node)) {
        setCityBoxShown(false);
      }
      if (dateBoxRef.current && !dateBoxRef.current.contains(e.target as Node)) {
        setRangeShown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [whereBoxRef, dateBoxRef]);

  return (
    <main className="flex min-h-screen flex-col items-center">
      <NavBar page="Home" />

      <section className="w-full py-20 px-4 xl:px-10 bg-green-700/10" style={{ background: `rgb(209,199,178)` }}>
        <div className="container mx-auto max-w-[650px] lg:max-w-[750px] xl:max-w-[1350px] *:text-primary">
          <div className="w-full grid grid-cols-1 xl:grid-cols-5 gap-16">
            <div className="col-span-full xl:col-span-2 bg-transparent text-white relative rounded-tl-[90px] overflow-hidden before:absolute 
          before:-right-10 xl:before:-right-20 before:-top-10 xl:before:-top-20 before:w-20 xl:before:w-40 before:h-20 xl:before:h-40 
          before:rotate-45 before:content-[''] before:z-10 before:shadow-custom-shadow-r px-5 lg:px-8 2xl:px-16 py-12 xl:py-16 rounded-b-xl">

              <div className="flex flex-col col-span-2 relative z-20">
                <h1 className="w-full font-light text-4xl xl:text-5xl tracking-wider leading-[50px] lg:leading-[60px]">Experience Home All Around The World</h1>
                <div className="w-full mt-6 text-xl xl:text-2xl font-light tracking-wider xl:leading-[40px]">
                  Downtown Den is meant to be something special. We pride our apartments in our experience traveling the world and not
                  having options we needed to be comfortable. Our deep rooted love for travel is put into all of our efforts to create
                  the best Downtown Dens for your experience.
                </div>
              </div>

            </div>


            <div className="col-span-full xl:col-span-3 mt-0 2xl:-mt-20">
              <div className="w-full 2xl:w-[40vw] p-4 lg:p-10 2xl:p-20 bg-white shadow-lg 
              shadow-gray-500 relative">
                <h1 className="w-full font-medium text-[30px] lg:text-[40px] tracking-wide leading-[35px] lg:leading-[50px]">
                  Settle in Comfortable, Discover New Worlds
                </h1>

                <div className="w-full font-normal text-lg tracking-wider mt-4 leading-[34px]">
                  Our elegantly furnished apartments offers adaptable living solutions, for stays longer than a month
                </div>

                <div className="w-full mt-4">
                  <div className="w-full bg-white grid grid-cols-1 lg:grid-cols-4 items-center relative space-y-4 lg:space-y-0">

                    <div ref={whereBoxRef} className="border lg:border-r-0 border-gray-400 flex flex-col py-3 px-3 lg:rounded-l-lg h-[105px]">
                      <div className="font-medium text-gray-500">Where?</div>
                      <div className="">
                        <input type="text" name="property_city" value={property_city} autoComplete="off" className="w-full px-3 pl-0 py-3 h-[55px] outline-none focus:outline-none text-base placeholder:text-sm"
                          placeholder="Search for a city" onChange={searchCity} onFocus={() => { showCityBox() }} />
                        {
                          city_box_shown && <div className="absolute w-full left-0 top-[99px] bg-white p-3 lg:p-6 border border-t-0 border-gray-400 flex 
                      flex-col rounded-b-lg z-20">
                            <h1 className="w-full font-semibod text-xl">Boston Neighborhoods</h1>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-5 *:cursor-pointer *:font-normal *:w-full 
                          lg:*:px-3 *:py-4 *:border-b-2 *:border-transparent *:text-gray-700">
                              {
                                !cities_loaded &&
                                <div className=" col-span-full w-full h-[200px] flex items-center justify-center">
                                  <AiOutlineLoading3Quarters size={25} className="animate-spin" />
                                </div>
                              }

                              {
                                cities_loaded && (
                                  <div className="hover:border-gray-500" onClick={() => setSelectedCity("All Neighborhoods")}>
                                    {property_city == "All Neighborhoods"
                                      ? <b>All Neighborhoods</b>
                                      : <>All Neighborhoods</>
                                    }
                                  </div>
                                )
                              }

                              {
                                cities_loaded && (
                                  cities_lists.map((city, index) => {
                                    const raw_city = city;
                                    if (property_city && property_city != "") {
                                      city = city.replace(new RegExp(property_city, "i"), (match) => `<b>${match}</b>`);
                                    }

                                    return <div key={index} className="hover:border-gray-500" onClick={() => setSelectedCity(raw_city)}
                                      dangerouslySetInnerHTML={{ __html: city }} />
                                  })
                                )
                              }
                            </div>
                          </div>
                        }

                      </div>
                    </div>

                    <div className="border lg:border-x-0 border-gray-400 flex flex-col py-3 px-3 h-[105px]">
                      <div className="font-medium text-gray-500">Move-in</div>
                      <div>
                        <input type="text" name="move_in" value={move_in} className="w-full px-3 pl-0 py-3 h-[55px] outline-none focus:outline-none text-base placeholder:text-sm"
                          placeholder="Select a date" onClick={() => { showDateRange() }} />
                      </div>
                    </div>

                    <div ref={dateBoxRef} className="border lg:border-x-0 border-gray-400 flex flex-col py-3 px-3 h-[105px]">
                      <div className="font-medium text-gray-500">Move-out</div>
                      <div className="right-0">
                        <input type="text" name="move_out" value={move_out} className="w-full px-3 pl-0 py-3 h-[55px] outline-none 
                      focus:outline-none text-base placeholder:text-sm" placeholder="Select a date" onClick={() => { showDateRange() }} />

                        {range_shown && <DateRange
                          editableDateInputs={false} className="z-50 -right-[12%] 2xs:right-[2%] lg:-right-[15%] absolute top-[0px] 
                          lg:top-[95px] border border-gray-300 shadow-xl"
                          onChange={(item) => setDates([item.selection])}
                          showPreview={false}
                          moveRangeOnFirstSelection={false}
                          ranges={dates}
                          months={2}
                          direction={calendar_dir}
                          maxDate={futureDate}
                          minDate={minDate}
                          //disabledDates={disabled_dates}
                          dayContentRenderer={customDayContent}
                        />
                        }

                      </div>
                    </div>

                    <div className="lg:border lg:border-l-0 border-gray-400 flex flex-col py-3 px-0 lg:px-3 lg:rounded-r-lg h-[105px] justify-center">
                      <div className="flex items-center justify-center px-4 py-4 bg-secondary text-white hover:shadow-lg 
                    hover:shadow-gray-400 cursor-pointer rounded select-none" onClick={searchProperties}>
                        <BiSearch size={16} className='mr-1' /> <span>Search</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              <div className="w-full 2xl:w-[40vw] clip-v-shape bg-white h-[150px] shadow-lg"></div>
            </div>
          </div>

          <div className="w-full hidden xl:grid grid-cols-3 mt-20 items-center relative">
            <div className="col-span-1 bg-transparent text-white relative rounded-tl-[90px] overflow-hidden before:absolute 
          rounded-b-xl rounded-br-[90px] h-[650px] flex justify-center w-[80%] m-auto">
              <div className="w-full h-full !bg-cover !bg-center relative z-20" style={{ backgroundImage: 'url(/Front-Page-2.png)' }}></div>
            </div>

            <div className="flex items-center justify-center col-span-2 relative z-20 h-[70vh]"
              style={{
                backgroundImage: 'url(/home-3.jpg)',
                backgroundAttachment: 'fixed',
                backgroundSize: 'auto 100%',
                backgroundPosition: '100% 0%',
                backgroundRepeat: "no-repeat",
              }}>
            </div>

          </div>
        </div>
      </section>

      <section className="w-full bg-white py-16 lg:py-32 px-4 lg:px-0">
        <div className="container mx-auto max-w-[1350px] *:text-primary">
          <div className="w-full text-5xl lg:text-6xl font-light flex items-center justify-center">The Highest Standard of Living</div>
          <div className="w-full max-w-[800px] m-auto flex justify-center text-center items-center mt-6 leading-9 tracking-wider text-xl">
            Whether you're taking a new business contract, testing out a new city, or simply looking for the nicer things in life;
            let us provide you with a simplistic solution to finding "home"
          </div>

          <div className="w-full flex justify-center text-center items-center mt-6">
            <CustomLinkMain href={`/search?neighborhood=All Neighborhoods&move_in=${moment(moment().add(1, "day")).format("YYYY-MM-DD")}&move_out=${moment(moment().add(32, "days")).format("YYYY-MM-DD")}&map_bounds=${JSON.stringify({ north: 42.60242525588096, south: 42.171848287543746, east: -70.73319879101562, west: -71.38688531445312 })}`} className="text-white px-8 py-3 bg-gray-950 cursor-pointer hover:shadow-2xl 
            hover:shadow-gray-900">Start Now</CustomLinkMain>
          </div>
        </div>
      </section>

      <section className="w-full grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 justify-items-end items-center relative h-[65vh] xl:h-[95vh] 
      px-3 lg:px-20" style={{
          backgroundImage: 'url(/home-hero-3.jpg)',
          backgroundAttachment: 'fixed',
          backgroundSize: '100% 100%',
          backgroundPosition: '0% 0%',
          backgroundRepeat: "no-repeat",
        }}>
        <div className="col-span-full md:col-span-2 bg-transparent md:col-start-2 xl:col-start-4 text-white relative 
          rounded-tr-[90px] overflow-hidden before:absolute before:-m-40 before:w-40 before:h-40 before:rotate-45 before:content-[''] 
          before:z-10 before:shadow-custom-shadow-l p-4 lg:p-16 rounded-b-xl">

          <div className="flex flex-col col-span-2 z-20 relative">
            <h1 className="w-full font-light text-4xl lg:text-5xl tracking-wider leading-[60px]">Comfort and Convenience</h1>
            <div className="w-full mt-6 text-2xl font-light tracking-wider leading-[40px]">
              World class apartments and homes chosen to host your next adventure
            </div>
          </div>
        </div>
      </section>

      <section className="w-full flex items-center justify-center px-10 lg:px-20 py-20 bg-primary">
        <div className=" underline underline-offset-8 text-5xl lg:text-6xl font-CormorantGaramond"
          style={{ color: "rgb(209, 199, 178)" }}>MORE THAN A RENTAL, A MEMORY</div>
      </section>

      <section className="w-full bg-gray-50 py-12 lg:py-32">
        <div className="w-full mx-auto max-w-[700px] lg:max-w-[1000px] xl:max-w-full px-4 lg:px-20">

          <div className="w-full grid grid-cols-1 xl:grid-cols-6 gap-16 relative">
            <div className="items-center justify-center col-span-full relative
            flex lg:col-span-full xl:col-span-4 2xl:col-span-4 h-[55dvh] lg:h-[75dvh] max-h-[75dvh] overflow-hidden">
              <div ref={divRef} className=" absolute w-[800px] lg:w-[1500px] -left-[250px] 2xs:-left-[150px] xs:-left-[100px] lg:-left-[150px] h-[55dvh] lg:h-[75dvh] top-0 bottom-0"
                style={{
                  backgroundImage: 'url(/home-hero-5.jpeg)',
                  backgroundAttachment: '',
                  //  backgroundSize: backgroundSize,
                  // backgroundPosition: bg_position,
                  backgroundSize: "cover",
                  backgroundPosition: 'center', // Initial position
                  backgroundRepeat: "no-repeat",
                }}>
              </div>
            </div>

            <div className="flex flex-col col-span-full lg:col-span-full xl:col-span-2 2xl:col-span-2 px-0 lg:px-16">
              <h1 className="w-full font-light text-5xl lg:text-6xl 2xl:text-7xl tracking-wide">Discover, Downtown Dens</h1>
              <div className="w-full mt-16 text-xl font-normal tracking-wide">
                Founded by Travelers, we want to ensure your time spent with us is unforgettable. We provide city experiences, guidance,
                and information with all of our rentals to make your stay delightful.
              </div>

              <div className="w-full">
                <CustomLinkMain className="cursor-pointer mt-4 flex justify-center duration-300 font-normal w-[200px] px-8 py-4 text-primary 
                bg-white border border-primary hover:bg-primary hover:text-white hover:shadow-2xl" href="/about-us">
                  LEARN MORE
                </CustomLinkMain>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="w-full bg-gray-50 py-12 lg:py-32">
        <div className="w-full mx-auto max-w-[700px] lg:max-w-[1000px] xl:max-w-full px-4 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            <div className="col-span-full xl:col-span-1 flex flex-col">
              <div className="w-full border-b border-gray-700 mb-10"></div>
              <div className="text-5xl lg:text-6xl font-light">What We Offer</div>
              <div className="text-xl font-medium mt-4 leading-9 tracking-widest">
                We provide a variety of fully furnished apartments to meet your needs. Our apartments are designed with your
                comfort in mind, and we strive to provide you with a home away from home experience.
              </div>

              <div className="w-full mt-6">
                <CustomLinkMain className="cursor-pointer mt-4 flex justify-center duration-300 font-normal w-[260px] px-8 py-4 text-primary 
                bg-white border border-primary hover:bg-primary hover:text-white hover:shadow-2xl" href={`/search?neighborhood=All Neighborhoods&move_in=${moment(moment().add(1, "day")).format("YYYY-MM-DD")}&move_out=${moment(moment().add(32, "days")).format("YYYY-MM-DD")}&map_bounds=${JSON.stringify({ north: 42.60242525588096, south: 42.171848287543746, east: -70.73319879101562, west: -71.38688531445312 })}`}>
                  VIEW ALL APARTMENTS
                </CustomLinkMain>
              </div>
            </div>


            <div className="col-span-full xl:col-span-2 flex flex-col lg:pl-20 xl:pl-32 2xl:pl-20 relative xl:h-[75vh] 2xl:h-[130vh]">
              <div className="col-span-full xl:col-span-2 flex flex-col mt-40 xl:mt-0 xl:bottom-10 xl:absolute">
                <div ref={ref1} className={` relative flex flex-col space-y-9 lg:flex-row lg:space-x-9`}>
                  <div className={`mt-6 lg:-mt-[150px] w-full lg:w-1/2 relative ${inView1 ? 'fade-in-up' : ''}`}>
                    <img src="/Front-Page-7.png" className="drop-shadow-xl rounded-lg" />
                    <div className=" absolute bg-black/70 text-yellow-200 top-1/3 left-1 lg:left-7 px-6 py-3 text-xl rounded-md font-normal">
                      Studio Apartments
                    </div>
                  </div>
                  <div className={` w-full lg:w-1/2 relative ${inView1 ? 'fade-in-up' : ''}`}>
                    <img src="/Front-Page-8.png" className="drop-shadow-xl rounded-lg" />
                    <div className=" absolute bg-black/70 text-yellow-200 top-1/3 left-1 lg:left-7 px-6 py-3 text-xl rounded-md font-normal">
                      Themed Apartment
                    </div>
                  </div>
                </div>

                <div ref={ref2} className={` relative flex flex-col space-y-9 lg:flex-row lg:space-x-9`}>
                  <div className={`mt-6 lg:-mt-[120px] lg:-ml-[150px] w-full lg:w-1/2 relative ${inView2 ? 'fade-in-up' : ''}`}>
                    <img src="/Front-Page-9.png" className="drop-shadow-xl rounded-lg" />
                    <div className=" absolute bg-black/70 text-yellow-200 top-1/3 left-1 lg:left-7 px-6 py-3 text-xl rounded-md font-normal">
                      One, Two-Bedroom Apartments
                    </div>
                  </div>

                  <div className={`mt-[30px] w-full lg:w-1/2 relative ${inView2 ? 'fade-in-up' : ''}`}>
                    <img src="/Front-Page-10.png" className="drop-shadow-xl rounded-lg" />
                    <div className=" absolute bg-black/70 text-yellow-200 top-1/3 left-1 lg:left-7 px-6 py-3 text-xl rounded-md font-normal">
                      One, Two-Bedroom Apartments
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 lg:py-32" style={{ backgroundColor: "rgba(202, 130, 99)" }}>
        <div className="w-full mx-auto max-w-[700px] lg:max-w-[1000px] xl:max-w-full px-4 lg:px-20">

          <div className="w-full grid grid-cols-1 xl:grid-cols-6 gap-16 relative">

            <div className="flex flex-col col-span-full lg:col-span-full xl:col-span-2 2xl:col-span-2 px-0 lg:px-16">
              <h1 className="w-full font-light text-4xl lg:text-6xl 2xl:text-6xl !leading-[1.2] tracking-wide">
                Book Your Stay Today
                Experience Downtown Den's Comfort and Convenience
              </h1>
              <div className="w-full mt-16 text-xl font-medium tracking-wide">
                Wherever You Are
              </div>

              <div className="w-full">
                <CustomLinkMain className="cursor-pointer mt-4 flex justify-center duration-300 font-normal w-[200px] px-8 py-4 text-primary 
                bg-transparent border border-primary hover:bg-primary hover:text-white hover:shadow-2xl"
                  href={`/search?neighborhood=All Neighborhoods&move_in=${moment(moment().add(1, "day")).format("YYYY-MM-DD")}&move_out=${moment(moment().add(32, "days")).format("YYYY-MM-DD")}&map_bounds=${JSON.stringify({ north: 42.60242525588096, south: 42.171848287543746, east: -70.73319879101562, west: -71.38688531445312 })}`}>
                  BOOK NOW
                </CustomLinkMain>
              </div>
            </div>

            <div className="items-center justify-center col-span-full relative
            flex lg:col-span-full xl:col-span-4 2xl:col-span-4 h-[65dvh] lg:h-[75dvh] max-h-[75dvh] overflow-hidden">
              <div ref={divRef2} className=" absolute w-[800px] md:w-[1100px] lg:w-[1500px] -right-[140px] xs:-right-[150px] lg:-right-[150px] h-[65dvh] lg:h-[75dvh] top-0 bottom-0"
                style={{
                  backgroundImage: 'url(/Front-Page-11.png)',
                  backgroundAttachment: '',
                  //  backgroundSize: backgroundSize,
                  // backgroundPosition: bg_position,
                  backgroundSize: "cover",
                  backgroundPosition: 'center', // Initial position
                  backgroundRepeat: "no-repeat",
                }}>
              </div>
            </div>

          </div>

        </div>
      </section>

      <section className="w-full bg-gray-50 py-12 lg:py-32">
        <div className="w-full mx-auto max-w-[700px] lg:max-w-[1000px] xl:max-w-full px-4 lg:px-20">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">

            <div className=" xl:col-span-1 pr-20">
              <div className="text-4xl lg:text-6xl font-light">What Our Guests Say</div>
            </div>

            <div className=" xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-10">

              <div className="">

                <div className="flex flex-col w-full font-normal !leading-[1.7]">
                  <div className="w-full border-b border-gray-300 mb-10"></div>
                  <div className="w-ful mb-4">Shine T.</div>
                  <div className="w-ful mb-4">
                    "I booked with Downtown Dens and wanted to extend my trip after the first week. The apartment was fantastic"
                  </div>
                  <div className="w-ful mb-4">- Fenway Diamond Apartment, Boston</div>
                </div>



                <div className="flex flex-col w-full font-normal !leading-[1.7] mt-10">
                  <div className="w-full border-b border-gray-300 mb-10"></div>
                  <div className="w-ful mb-4">Elizabeth B.</div>
                  <div className="w-ful mb-4">
                    “I loved my stay at Downtown Den. The apartment was stylish and well-equipped, and the location was perfect for exploring the city.”
                  </div>
                </div>


              </div>

              <div className="--space-- lg:hidden 2xl:block"></div>

              <div className="">

                <div className="flex flex-col w-full font-normal !leading-[1.7]">
                  <div className="w-full border-b border-gray-300 mb-10"></div>
                  <div className="w-ful mb-4">Logan M.</div>
                  <div className="w-ful mb-4">
                    “I loved my stay at Downtown Den. The apartment was stylish and well-equipped, and the location was perfect for exploring the city.”
                  </div>
                </div>


                <div className="flex flex-col w-full font-normal !leading-[1.7] mt-10">
                  <div className="w-full border-b border-gray-300 mb-10"></div>
                  <div className="w-ful mb-4">Rosario M.</div>
                  <div className="w-ful mb-4">
                    “I highly recommend Downtown Den for anyone looking for a comfortable and convenient stay in the heart of the city.”
                  </div>
                </div>


              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 lg:py-32 h-[55dvh] lg:h-[90dvh]" style={{
        backgroundImage: 'url(/Front-Page-12.jpg)',
        backgroundAttachment: '',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: "no-repeat",
      }}>
        <div className="w-full mx-auto max-w-[600px] lg:max-w-[1000px] px-4 lg:px-20">
          <div className="text-white font-normal text-4xl lg:text-6xl">Book Your Stay<br />Today</div>
          <div className="w-full mt-8">
            <CustomLinkMain href={`/search?neighborhood=All Neighborhoods&move_in=${moment(moment().add(1, "day")).format("YYYY-MM-DD")}&move_out=${moment(moment().add(32, "days")).format("YYYY-MM-DD")}&map_bounds=${JSON.stringify({ north: 42.60242525588096, south: 42.171848287543746, east: -70.73319879101562, west: -71.38688531445312 })}`}
              className="text-primary px-8 py-4 bg-white cursor-pointer hover:shadow-2xl hover:text-white 
              hover:bg-primary duration-300">Book Now</CustomLinkMain>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
