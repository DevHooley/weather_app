'use client';

'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { format, fromUnixTime, parseISO, secondsInDay } from 'date-fns';

import Navbar from '../components/Navbar';
import WeatherIcon from '@/components/weatherIcon';
import WeatherDetails from '@/components/WeatherDetails';
import ForecastWeatherDetail from '@/components/ForecastWeatherDetail';
import Container from '@/components/Container';

import { loadingCityAtom } from '@/app/atom';
import { placeAtom } from '@/app/atom';
import { convertKelvinToFahrenheit } from '@/utilities/convertKelvinToFahrenheit';
import { metersToMiles } from '@/utilities/metersToMiles';
import { convertWindSpeed } from '@/utilities/convertWindSpeed';
import getDayOrNightIcon from '@/utilities/getDayOrNightIcon';

// Define your interfaces here

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherListItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

interface WeatherListItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  rain?: {
    '3h': number;
  };
  sys: {
    pod: string;
  };
  dt_txt: string;
}

export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity] = useAtom(loadingCityAtom);

  const { isLoading, error, data, refetch } = useQuery<WeatherData>({
    queryKey: ['repoData'],
    queryFn: async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`
      );
      return data;
    },
  });

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  const firstData = data?.list[0];

  console.log('data', data);

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split('T')[0]
      )
    ),
  ];

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split('T')[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });

  if (isLoading)
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Loading...</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location={data?.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/* today data */}
        {loadingCity ? (
          <WeatherSkeleton />
        ) : (
          <>
            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="flex gap-1 text-2xl items-end">
                  <p> {format(parseISO(firstData?.dt_txt ?? ''), 'EEEE')}</p>
                  <p className="text-xl">
                    | {format(parseISO(firstData?.dt_txt ?? ''), 'dd.MM.yyyy')}
                  </p>
                </h2>
                <Container className="flex gap-10 px-6 items-center">
                  <div className="flex flex-col px-4">
                    <span className="text-5xl">
                      {convertKelvinToFahrenheit(
                        firstData?.main.temp ?? 296.37
                      )}
                      °F
                    </span>
                    <p className="text-xs space-x-1 whitespace-nowrap">
                      <span>Feels like</span>
                      <span>
                        {convertKelvinToFahrenheit(
                          firstData?.main.feels_like ?? 296.37
                        )}
                        °F
                      </span>
                    </p>
                    <p className="text-xs space-x-2">
                      <span>
                        {convertKelvinToFahrenheit(
                          firstData?.main.temp_min ?? 0
                        )}
                        °↓
                      </span>

                      <span>
                        {convertKelvinToFahrenheit(
                          firstData?.main.temp_max ?? 0
                        )}
                        °↑
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                    {data?.list.map((d, i) => (
                      <div
                        key={i}
                        className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                      >
                        <p className="whitespace-nowrap">
                          {format(parseISO(d.dt_txt), 'h:mm a:')}{' '}
                        </p>
                        <WeatherIcon
                          iconname={getDayOrNightIcon(
                            d.weather[0].icon,
                            d.dt_txt
                          )}
                        />
                        <p>{convertKelvinToFahrenheit(d?.main.temp ?? 0)}°</p>
                      </div>
                    ))}
                  </div>
                </Container>
              </div>
              <div className="flex gap-4">
                {/* left */}
                <Container className="w-fit justify-center flex-col px-4 items-center">
                  <p className=" capitalize text-center">
                    {firstData?.weather[0].description}
                  </p>
                  <WeatherIcon
                    iconname={getDayOrNightIcon(
                      firstData?.weather[0].icon ?? '',
                      firstData?.dt_txt ?? ''
                    )}
                  />
                </Container>
                <Container className="bg-orange-300/80 px-6 gap-4 justify-between overflow-x-auto">
                  <WeatherDetails
                    visability={metersToMiles(firstData?.visibility ?? 10000)}
                    airPressure={`${firstData?.main.pressure} hPa`}
                    humidity={`${firstData?.main.humidity}%`}
                    sunrise={format(
                      fromUnixTime(data?.city.sunrise ?? 0),
                      'h:mm a'
                    )}
                    sunset={format(
                      fromUnixTime(data?.city.sunset ?? 0),
                      'h:mm a'
                    )}
                    windSpeed={convertWindSpeed(firstData?.wind.speed ?? 0)}
                  />
                </Container>
                {/* right */}
              </div>
            </section>
            {/* 7 day forcast data */}
            <section className="flex w-full flex-col gap-4">
              <p className="text-2xl">Forcast ( 7 days) </p>
              {firstDataForEachDate.map((d, i) => (
                <ForecastWeatherDetail
                  key={i}
                  description={d?.weather[0].description ?? ''}
                  weatherIcon={d?.weather[0].icon ?? '01d'}
                  date={format(parseISO(d?.dt_txt ?? ''), 'dd.MM')}
                  day={format(parseISO(d?.dt_txt ?? ''), 'EEEE')}
                  feels_like={d?.main.feels_like ?? 0}
                  temp={d?.main.temp ?? 0}
                  temp_max={d?.main.temp_max ?? 0}
                  temp_min={d?.main.temp_min ?? 0}
                  airPressure={`${d?.main.pressure} hPa`}
                  humidity={`${d?.main.humidity}%`}
                  sunrise={format(
                    fromUnixTime(data?.city.sunrise ?? 0),
                    'h:mm a'
                  )}
                  sunset={format(
                    fromUnixTime(data?.city.sunset ?? 0),
                    'h:mm a'
                  )}
                  visability={`${metersToMiles(d?.visibility ?? 10000)} mi`}
                  windSpeed={convertWindSpeed(d?.wind.speed ?? 0)}
                />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

import React from 'react';

function WeatherSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Today data skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded w-40"></div>
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 ml-2 rounded"></div>
        </div>
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 ml-2 rounded"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-300 w-12 rounded"></div>
          <div className="h-4 bg-gray-300 w-12 rounded"></div>
        </div>
        {/* Loop over 4-hour forecast skeleton */}
        <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
            >
              <div className="h-4 bg-gray-300 w-8 rounded"></div>
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              <div className="h-4 bg-gray-300 w-8 rounded"></div>
            </div>
          ))}
        </div>
      </div>
      {/* Forecast data skeleton */}
      <div className="flex flex-col gap-4">
        <div className="h-6 bg-gray-300 w-40"></div>
        {/* Loop over forecast data skeleton */}
        {[...Array(7)].map((_, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col justify-center items-center">
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              <div className="h-4 bg-gray-300 w-20 rounded"></div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-gray-300 w-24 rounded"></div>
              <div className="h-4 bg-gray-300 w-24 rounded"></div>
              <div className="h-4 bg-gray-300 w-24 rounded"></div>
              <div className="h-4 bg-gray-300 w-24 rounded"></div>
              <div className="h-4 bg-gray-300 w-24 rounded"></div>
              <div className="h-4 bg-gray-300 w-24 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
