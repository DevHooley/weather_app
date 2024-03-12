import React from 'react';
import Container from './Container';
import WeatherIcon from './weatherIcon';
import WeatherDetails, { WeatherDetailProps } from './WeatherDetails';
import { convertKelvinToFahrenheit } from '@/utilities/convertKelvinToFahrenheit';

export interface ForecastWeatherDetailProps extends WeatherDetailProps {
  weatherIcon: string;
  date: string;
  day: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  description: string;
}

export default function ForecastWeatherDetail(
  props: ForecastWeatherDetailProps
) {
  const {
    weatherIcon = '01d',
    date = '2021-09-19 12:00:00',
    day = 'Sunday',
    temp = 75,
    feels_like = 75,
    temp_min = 75,
    temp_max = 75,
    description = 'Clear Sky',
  } = props;

  return (
    <Container className="gap-4">
      <section className="flex gap-4 items-center px-4">
        <div className="flex flex-col gap-1 items-center">
          <WeatherIcon iconname={weatherIcon} />
          <p>{date}</p>
          <p className="text-sm">{day}</p>
        </div>
        {/* ... */}
        <div className="flex flex-col px-4">
          <span className="text-5xl">
            {convertKelvinToFahrenheit(temp ?? 0)}°
          </span>
          <p className="text-xs space-x-1 whitespace-nowrap">
            <span className="">Feels like</span>
            <span className="">
              {convertKelvinToFahrenheit(feels_like ?? 0)}°
            </span>
          </p>
          <p className="capitalize ">{description}</p>
        </div>
      </section>
      <section className="overflow-x-auto flex justify-between gap-4 px-4 w-full pr-10">
        <WeatherDetails {...props} />
      </section>
    </Container>
  );
}
