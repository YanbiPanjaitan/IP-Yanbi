import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {fetchCountries, fetchCountryDetails} from "../store/countries";
import {Link} from "react-router";

export default function HomePage() {
  const dispatch = useDispatch();
  const {list, coordinates} = useSelector((state) => state.countries);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    dispatch(fetchCountries({page, limit, search, filter}));
  }, [dispatch, page, search, filter]);

  const handleCountryClick = (id) => {
    dispatch(fetchCountryDetails(id));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-center mb-8">Countries</h1>

      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Search countries..."
          value={search}
          onChange={handleSearchChange}
          className="input input-bordered w-full max-w-xs mr-2"
        />
        <select
          value={filter}
          onChange={handleFilterChange}
          className="select select-bordered w-full max-w-xs">
          <option value="">All Regions</option>
          <option value="Africa">Africa</option>
          <option value="Americas">Americas</option>
          <option value="Asia">Asia</option>
          <option value="Europe">Europe</option>
          <option value="Oceania">Oceania</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 ml-10">
        {list.data.map((country) => (
          <div key={country.id} className="card w-80 bg-base-100 shadow-xl">
            <figure>
              <img
                src={country.flagUrl}
                alt={`${country.name} flag`}
                className="w-full h-40 object-cover"
              />
            </figure>
            <div className="card-body items-center">
              <h2>{country.name}</h2>
              <p>Capital: {country.capital}</p>
              <p>Region: {country.region}</p>
              <p>Population: {country.population}</p>
              <div className="card-actions">
                <Link
                  to={`/countries/${country.id}`}
                  className="btn btn-primary"
                  onClick={() => handleCountryClick(country.id)}>
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="btn btn-secondary mr-2"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}>
          Previous
        </button>
        <span className="text-lg">Page {page}</span>
        <button
          className="btn btn-secondary ml-2"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === list.totalPages}>
          Next
        </button>
      </div>

      {coordinates.lat && coordinates.lng && (
        <div className="text-center mt-4">
          <h3>Coordinates</h3>
          <p>Latitude: {coordinates.lat}</p>
          <p>Longitude: {coordinates.lng}</p>
        </div>
      )}
    </div>
  );
}
