import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router";
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

  const access_token = localStorage.getItem("access_token");

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
        setReviews(reviewsRes.data);
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
        headers: {Authorization: `Bearer ${access_token}`},
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
    try {
      const response = await axios.post(`/countries/${id}/reviews`, newReview, {
        headers: {Authorization: `Bearer ${access_token}`},
      });
      setReviews([...reviews, response.data]);
      setNewReview({rating: "", comment: ""});
      Swal.fire("Success!", "Your review has been added.", "success");
    } catch (error) {
      console.error("Error adding review:", error);
      Swal.fire("Error!", "Failed to add review.", "error");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!country) return <p>Country not found.</p>;

  return (
    <div>
      <Navbar />
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">{country.name}</h1>
        <p className="text-lg mb-2">
          <strong>Region:</strong> {country.region}
        </p>

        {/* Unsplash Photos */}
        <h2 className="text-2xl font-semibold mb-2">Photos</h2>
        {Array.isArray(photos) && photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.urls.small}
                alt={photo.alt_description}
                className="w-full h-40 object-cover rounded-lg"
              />
            ))}
          </div>
        ) : (
          <p>No photos found.</p>
        )}

        {/* AI Summary */}
        <h2 className="text-2xl font-semibold mb-2">Summary</h2>
        <p className="mb-4">{summary}</p>

        {/* Google Map */}
        <h2 className="text-2xl font-semibold mb-2">Map</h2>
        {mapUrl ? (
          <iframe
            title="Google Maps"
            width="100%"
            height="400"
            loading="lazy"
            className="rounded-lg mb-4"
            src={mapUrl}
            allowFullScreen
          />
        ) : (
          <p>Map not available.</p>
        )}

        {/* Add Review Form */}
        {access_token && (
          <form onSubmit={handleSubmitReview} className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Add a Review</h3>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Rating:</label>
              <input
                type="number"
                min="1"
                max="5"
                value={newReview.rating}
                onChange={(e) =>
                  setNewReview({...newReview, rating: e.target.value})
                }
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Comment:</label>
              <textarea
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({...newReview, comment: e.target.value})
                }
                className="w-full border rounded-lg px-3 py-2"
                rows="3"
                required></textarea>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg">
              Submit Review
            </button>
          </form>
        )}
        {Array.isArray(reviews) && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 border rounded-lg shadow-md bg-white">
                <p className="text-lg font-semibold">Rating: {review.rating}</p>
                <p className="text-gray-700 mb-2">{review.comment}</p>
                {access_token && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-500 hover:underline">
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews available for this country.</p>
        )}
      </div>
    </div>
  );
}
