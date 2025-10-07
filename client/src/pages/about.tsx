import React from "react";

const version = "0.0.8"; // also change docker-compose.yml version

export default function About() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">About Whatsapp Intelligence</h1>
      <p className="mb-2">This is an intelligent WhatsApp integration platform.</p>
      <p className="text-gray-500">Version: <span data-testid="version-number">{version}</span></p>
    </div>
  );
}
