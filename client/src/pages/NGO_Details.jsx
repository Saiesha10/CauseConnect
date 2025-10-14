import React from "react";
import { useParams } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";

const GET_NGO = gql`
  query GetNGO($id: uuid!) {
    ngos_by_pk(id: $id) {
      id
      name
      cause
      description
      location
      contact_info
      donation_link
      ngo_picture
    }
  }
`;

const NGO_Details = () => {
  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_NGO, { variables: { id } });

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error.message}</p>;
  if (!data.ngos_by_pk) return <p className="text-center mt-10">NGO not found</p>;

  const ngo = data.ngos_by_pk;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{ngo.name}</h2>
      {ngo.ngo_picture && <img src={ngo.ngo_picture} alt={ngo.name} className="mb-4 rounded" />}
      <p className="mb-2"><strong>Cause:</strong> {ngo.cause}</p>
      <p className="mb-2"><strong>Description:</strong> {ngo.description}</p>
      <p className="mb-2"><strong>Location:</strong> {ngo.location}</p>
      <p className="mb-2"><strong>Contact:</strong> {ngo.contact_info}</p>
      {ngo.donation_link && (
        <a
          href={ngo.donation_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Donate
        </a>
      )}
    </div>
  );
};

export default NGO_Details;
