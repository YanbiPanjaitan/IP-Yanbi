import React, {useEffect, useState} from "react";
import {useParams} from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../component/Navbar";
import {decodeJWT} from "../helpers/decodeJWT";

export default function Detail() {
  const {id} = useParams();
  const [country, setCountry] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState("");
  const [photos, setPhotos] = useState([]);
  const [mapUrl, setMapUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({rating: "", comment: ""});
  const [accessToken] = useState(localStorage.getItem("access_token"));
  const [isCommentVisible, setIsCommentVisible] = useState(false);
  const [editReview, setEditReview] = useState(null);

  const decodedToken = accessToken ? decodeJWT(accessToken) : null;
  const loggedInUserEmail = decodedToken ? decodedToken.email : "unknown";

  console.log(
    "inilocalstoreage",
    localStorage,
    "ini acces token",
    "access_token",
    accessToken
  ); // Log token akses

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countryRes, reviewsRes, summaryRes, unsplashRes /*, mapRes*/] =
          await Promise.all([
            axios.get(`http://localhost:3000/countries/${id}`),
            axios.get(`http://localhost:3000/countries/${id}/reviews`),
            axios.get(`http://localhost:3000/countries/${id}/summary`),
            axios.get(`http://localhost:3000/countries/${id}/unsplash`),
            // axios.get(`http://localhost:3000/countries/${id}/googleMaps`),
          ]);

        setCountry(countryRes.data);
        console.log("Reviews response:", reviewsRes.data); // Log data dari response reviews
        console.log(
          "Processed reviews:",
          Array.isArray(reviewsRes.data) ? reviewsRes.data : []
        ); // Log hasil proses reviews
        if (!Array.isArray(reviewsRes.data)) {
          console.warn(
            "Reviews data is not an array. Setting reviews to an empty array."
          );
          setReviews([]);
        } else {
          setReviews(reviewsRes.data);
        }
        setSummary(summaryRes.data.summary);
        setPhotos(unsplashRes.data.photos);
        // setMapUrl(mapRes.data.mapUrl);
      } catch (error) {
        console.log("Fetching reviews for country ID:", id); // Log ID negara
        console.log(
          "Error details:",
          error.response ? error.response.data : error.message
        ); // Log detail error
        if (error.response && error.response.status === 404) {
          console.info(
            "No reviews found for this country. This is expected behavior."
          );
          setReviews([]); // Set reviews to an empty array
        } else {
          console.error("Unexpected error fetching data:", error);
          Swal.fire("Error!", "Failed to fetch data.", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    console.log("Logged in user email:", loggedInUserEmail); // Log email pengguna yang sedang login
    reviews.forEach((review) => {
      console.log("Review user email:", review.User?.email); // Log email pengguna pembuat review
    });
  }, [loggedInUserEmail, reviews]);

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`http://localhost:3000/reviews/${reviewId}`, {
        headers: {Authorization: `Bearer ${accessToken}`},
      });
      setReviews(reviews.filter((review) => review.id !== reviewId));
      Swal.fire("Deleted!", "Your review has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting review:", error);
      Swal.fire("Error!", "Failed to delete review.", "error");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (newReview.rating < 1 || newReview.rating > 5) {
      Swal.fire("Error!", "Rating must be between 1 and 5.", "error");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/countries/${id}/reviews`,
        newReview,
        {
          headers: {Authorization: `Bearer ${accessToken}`},
        }
      );
      setReviews([...reviews, response.data]);
      setNewReview({rating: "", comment: ""});
      setIsCommentVisible(false);
      Swal.fire("Success!", "Your review has been added.", "success");
    } catch (error) {
      console.error("Error adding review:", error);
      Swal.fire("Error!", "Failed to add review.", "error");
    }
  };

  const handleEditReview = (review) => {
    setEditReview(review);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:3000/reviews/${editReview.id}`,
        {rating: editReview.rating, comment: editReview.comment},
        {headers: {Authorization: `Bearer ${accessToken}`}}
      );
      setReviews(
        reviews.map((review) =>
          review.id === editReview.id ? response.data : review
        )
      );
      setEditReview(null);
      Swal.fire("Success!", "Your review has been updated.", "success");
    } catch (error) {
      console.error("Error updating review:", error);
      Swal.fire("Error!", "Failed to update review.", "error");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-white">Loading...</p>;
  if (!country)
    return <p className="text-center mt-10 text-white">Country not found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
            {country.name}
          </h1>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-lg text-gray-700 mb-2">
                <strong>Region:</strong> {country.region}
              </p>
              <p className="text-lg text-gray-700 mb-2">
                <strong>Country:</strong> {country.name}
              </p>
              <p className="text-lg text-gray-700 mb-2">
                <strong>Capital:</strong> {country.capital}
              </p>
            </div>
            <div className="w-full h-64">
              {mapUrl ? (
                <iframe
                  title="Google Maps"
                  width="100%"
                  height="100%"
                  className="rounded-lg"
                  loading="lazy"
                  src={mapUrl}
                  allowFullScreen
                />
              ) : (
                <p>Map not available.</p>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Photos</h2>
          {Array.isArray(photos) && photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.urls.small}
                  alt={photo.alt_description}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          ) : (
            <p className="mb-4 text-gray-600">No photos found.</p>
          )}

          {accessToken && (
            <>
              <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  AI Summary
                </h2>
                <p className="text-gray-700 mb-6">{summary}</p>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-300"
                  onClick={() => alert("AI Summary clicked!")}>
                  Click Here
                </button>
              </div>

              <h2 className="text-2xl font-semibold text-gray-800 mb-2 mt-6">
                Reviews
              </h2>
              {reviews.length === 0 ? (
                <p className="text-gray-600 mb-6">
                  No reviews yet for this country.
                </p>
              ) : (
                <ul className="space-y-4 mb-6">
                  {reviews.map((review) => (
                    <li key={review.id} className="border p-4 rounded-lg">
                      <p className="font-semibold">
                        Rating: {review.rating} / 5
                      </p>
                      <p className="font-semibold">
                        User: {review.User?.username || "Unknown"}
                      </p>
                      <p className="text-gray-700">{review.comment}</p>
                      {review.User?.email === loggedInUserEmail && (
                        <div className="mt-2">
                          <button
                            onClick={() => handleEditReview(review.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mr-2">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                            Delete
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {editReview && (
                <form onSubmit={handleUpdateReview} className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    Edit Review
                  </h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating (1-5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={editReview.rating}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? ""
                            : Math.min(5, Math.max(1, e.target.value));
                        setEditReview({...editReview, rating: value});
                      }}
                      className="w-full border bg-blue-300 px-3 py-2 rounded-lg"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment
                    </label>
                    <textarea
                      rows="3"
                      value={editReview.comment}
                      onChange={(e) =>
                        setEditReview({...editReview, comment: e.target.value})
                      }
                      className="w-full border bg-blue-300 text-white px-3 py-2 rounded-lg"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Update Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditReview(null)}
                    className="ml-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                    Cancel
                  </button>
                </form>
              )}

              <div>
                <button
                  onClick={() => setIsCommentVisible(!isCommentVisible)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-4">
                  Create Comment
                </button>

                {isCommentVisible && (
                  <form onSubmit={handleSubmitReview}>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      Add a Review
                    </h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newReview.rating}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? ""
                              : Math.min(5, Math.max(1, e.target.value));
                          setNewReview({...newReview, rating: value});
                        }}
                        className="w-full border bg-blue-300 px-3 py-2 rounded-lg"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comment
                      </label>
                      <textarea
                        rows="3"
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            comment: e.target.value,
                          })
                        }
                        className="w-full border bg-blue-300 px-3 py-2 rounded-lg"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                      Submit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCommentVisible(false)}
                      className="ml-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
