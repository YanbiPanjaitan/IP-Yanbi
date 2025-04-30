import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router";
import axios from "axios";

export default function Detail() {
  const {id} = useParams();
  const navigate = useNavigate();

  const [country, setCountry] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState("");
  const [photos, setPhotos] = useState([]);
  const [mapUrl, setMapUrl] = useState("");
  const [loading, setLoading] = useState(true);

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

  const handleAddReview = () => {
    navigate(`/countries/${id}/reviews/add`);
  };

  if (loading) return <p>Loading...</p>;
  if (!country) return <p>Country not found.</p>;

  return (
    <div style={{padding: "1rem"}}>
      <h1>{country.name}</h1>
      <p>
        <strong>Region:</strong> {country.region}
      </p>

      {/* Unsplash Photos */}
      <h2>Photos</h2>
      {Array.isArray(photos) && photos.length > 0 ? (
        <div style={{display: "flex", gap: "10px", overflowX: "auto"}}>
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.urls.small}
              alt={photo.alt_description}
              style={{width: "200px", borderRadius: "10px"}}
            />
          ))}
        </div>
      ) : (
        <p>No photos found.</p>
      )}

      {/* AI Summary */}
      <h2>Summary</h2>
      <p>{summary}</p>

      {/* Google Map */}
      <h2>Map</h2>
      {mapUrl ? (
        <iframe
          title="Google Maps"
          width="100%"
          height="400"
          loading="lazy"
          style={{border: 0, borderRadius: "10px"}}
          src={mapUrl}
          allowFullScreen
        />
      ) : (
        <p>Map not available.</p>
      )}

      {/* Reviews */}
      <h2>Reviews</h2>
      <button onClick={handleAddReview}>Add Review</button>
      {Array.isArray(reviews) && reviews.length > 0 ? (
        <ul>
          {reviews.map((review) => (
            <li key={review.id} style={{marginBottom: "1rem"}}>
              <p>
                <strong>Rating:</strong> {review.rating}
              </p>
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews available for this country.</p>
      )}
    </div>
  );
}
