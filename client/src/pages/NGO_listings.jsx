import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";

const GET_NGOS = gql`
  query GetNGOs {
    ngos {
      id
      name
      cause
      location
    }
  }
`;

const NGO_Listings = () => {
    const { loading, error, data } = useQuery(GET_NGOS);

    if (loading) return <p className="text-center mt-10">Loading NGOs...</p>;
    if (error) return <p className="text-center mt-10 text-red-500">Error: {error.message}</p>;

    return (
        <div className="max-w-4xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.ngos.map((ngo) => (
                <Link
                    to={`/ngos/${ngo.id}`}
                    key={ngo.id}
                    className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
                >
                    <h3 className="text-xl font-semibold">{ngo.name}</h3>
                    <p className="text-gray-600">{ngo.cause}</p>
                    <p className="text-gray-500 text-sm">{ngo.location}</p>
                </Link>
            ))}
        </div>
    );
};

export default NGO_Listings;
