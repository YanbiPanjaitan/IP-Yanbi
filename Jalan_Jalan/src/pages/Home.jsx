import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {fetchCountries, fetchCountryDetails} from "../store/countries";
import {Link} from "react-router";
import Navbar from "../component/Navbar";

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
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            Countries
          </h1>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={handleSearchChange}
              className="w-full md:max-w-xs px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800"
            />
            <select
              value={filter}
              onChange={handleFilterChange}
              className="w-full md:max-w-xs px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800">
              <option value="">All Regions</option>
              <option value="Africa">Africa</option>
              <option value="Americas">Americas</option>
              <option value="Asia">Asia</option>
              <option value="Europe">Europe</option>
              <option value="Oceania">Oceania</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {list.data.map((country) => (
              <div
                key={country.id}
                className="bg-white border rounded-xl shadow-md overflow-hidden">
                <img
                  src={country.flagUrl}
                  alt={`${country.name} flag`}
                  className="w-full h-40 object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                />
                <div className="p-4 text-center">
                  <h2 className="text-lg font-bold text-gray-800">
                    {country.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Capital: {country.capital}
                  </p>
                  <p className="text-sm text-gray-600">
                    Region: {country.region}
                  </p>
                  <p className="text-sm text-gray-600">
                    Population: {country.population}
                  </p>
                  <div className="mt-3">
                    <Link
                      to={`/countries/${country.id}`}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-300"
                      onClick={() => handleCountryClick(country.id)}>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {list.totalPages > 1 && (
            <nav className="flex justify-center mt-10">
              <ul className="flex gap-2">
                <li>
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}>
                    &#60;
                  </button>
                </li>
                {Array.from({length: Math.min(5, list.totalPages)}).map(
                  (_, i) => {
                    let pageNum;
                    if (list.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= list.totalPages - 2) {
                      pageNum = list.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <li key={i}>
                        <button
                          className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                            pageNum === page
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
                          }`}
                          onClick={() => handlePageChange(pageNum)}>
                          {pageNum}
                        </button>
                      </li>
                    );
                  }
                )}
                <li>
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                    disabled={page === list.totalPages || list.totalPages === 0}
                    onClick={() => handlePageChange(page + 1)}>
                    &#62;
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
