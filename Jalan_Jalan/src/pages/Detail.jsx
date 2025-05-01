import React, {useEffect, useState} from "react";
import {useParams} from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../component/Navbar";

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
  const [isCommentVisible, setIsCommentVisible] = useState(false); // State untuk kontrol visibilitas form komentar

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countryRes, reviewsRes, summaryRes, unsplashRes, mapRes] =
          await Promise.all([
            axios.get(`/countries/${id}`),
            axios.get(`/countries/${id}/reviews`),
            axios.get(`/countries/${id}/summary`),
            axios.get(`/countries/${id}/unsplash`),
            axios.get(`/countries/${id}/googleMaps`),
          ]);

        setCountry(countryRes.data);
        setReviews(
          Array.isArray(reviewsRes.data)
            ? reviewsRes.data
            : Array.isArray(reviewsRes.data.reviews)
            ? reviewsRes.data.reviews
            : []
        );
        setSummary(summaryRes.data.summary);
        setPhotos(unsplashRes.data.photos);
        setMapUrl(mapRes.data.mapUrl);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`/reviews/${reviewId}`, {
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

    // Validasi rating antara 1 dan 5
    if (newReview.rating < 1 || newReview.rating > 5) {
      Swal.fire("Error!", "Rating must be between 1 and 5.", "error");
      return;
    }

    try {
      const response = await axios.post(`/countries/${id}/reviews`, newReview, {
        headers: {Authorization: `Bearer ${accessToken}`},
      });
      setReviews([...reviews, response.data]);
      setNewReview({rating: "", comment: ""});
      setIsCommentVisible(false); // Menyembunyikan form setelah berhasil submit
      Swal.fire("Success!", "Your review has been added.", "success");
    } catch (error) {
      console.error("Error adding review:", error);
      Swal.fire("Error!", "Failed to add review.", "error");
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
                <strong>Capital:</strong> {country.capital}
              </p>
              <p className="text-lg text-gray-700 mb-2">
                <strong>Population:</strong> {country.population}
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

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            AI Summary
          </h2>
          <p className="text-gray-700 mb-6">{summary}</p>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reviews</h2>
          {Array.isArray(reviews) && reviews.length > 0 ? (
            <ul className="space-y-4 mb-6">
              {reviews.map((review) => (
                <li key={review.id} className="border p-4 rounded-lg">
                  <p className="font-semibold">Rating: {review.rating} / 5</p>
                  <p className="text-gray-700">{review.comment}</p>
                  {accessToken && (
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-500 mt-2 hover:underline text-sm">
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 mb-6">No reviews yet.</p>
          )}

          {accessToken && (
            <div>
              <button
                onClick={() => setIsCommentVisible(!isCommentVisible)} // Toggle visibility
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-4">
                Create Comment
              </button>

              {/* Kolom komentar hanya muncul jika isCommentVisible true */}
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
                        // Batasi agar rating tetap antara 1 dan 5
                        const value = Math.min(5, Math.max(1, e.target.value));
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
                        setNewReview({...newReview, comment: e.target.value})
                      }
                      className="w-full border bg-blue-300 text-white px-3 py-2 rounded-lg"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
