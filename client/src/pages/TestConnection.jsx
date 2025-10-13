import React from "react";
import { gql, useQuery } from "@apollo/client";

const TEST_QUERY = gql`{ __typename }`;

const TestConnection = () => {
    const { loading, error, data } = useQuery(TEST_QUERY);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    return <pre>{JSON.stringify(data)}</pre>;
};

export default TestConnection;
