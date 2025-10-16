'use client';

import React from 'react';

const teams = ['Alpha', 'Beta', 'Gamma', 'Delta'];

const projects = [
  { name: 'Project Apollo', teams: ['Alpha', 'Gamma'] },
  { name: 'Project Borealis', teams: ['Beta', 'Delta'] },
  { name: 'Project Cosmos', teams: ['Alpha', 'Beta', 'Gamma'] },
  { name: 'Project Delta', teams: ['Delta'] }
];

export default function WorkTable() {
  return (
    <div className="p-6 bg-white rounded-lg shadow mb-8 rel">
      <h2 className="text-2xl font-semibold mb-6">Work Assignment</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left font-medium text-gray-700">Project Name</th>
              {teams.map((team) => (
                <th key={team} className="py-2 px-4 text-center font-medium text-gray-700">{team}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.name} className="border-t">
                <td className="py-2 px-4 font-medium text-gray-800">{project.name}</td>
                {teams.map((team) => (
                  <td key={team} className="py-2 px-4 text-center">
                    {project.teams.includes(team) ? (
                      <span className="inline-block text-blue-500 text-lg" title="Assigned">
                        <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path fill="currentColor" d="m18.774 8.245-.892-.893a1.5 1.5 0 0 1-.437-1.052V5.036a2.484 2.484 0 0 0-2.48-2.48H13.7a1.5 1.5 0 0 1-1.052-.438l-.893-.892a2.484 2.484 0 0 0-3.51 0l-.893.892a1.5 1.5 0 0 1-1.052.437H5.036a2.484 2.484 0 0 0-2.48 2.481V6.3a1.5 1.5 0 0 1-.438 1.052l-.892.893a2.484 2.484 0 0 0 0 3.51l.892.893a1.5 1.5 0 0 1 .437 1.052v1.264a2.484 2.484 0 0 0 2.481 2.481H6.3a1.5 1.5 0 0 1 1.052.437l.893.892a2.484 2.484 0 0 0 3.51 0l.893-.892a1.5 1.5 0 0 1 1.052-.437h1.264a2.484 2.484 0 0 0 2.481-2.48V13.7a1.5 1.5 0 0 1 .437-1.052l.892-.893a2.484 2.484 0 0 0 0-3.51Z"/>
                        </svg>
                      </span>
                    ) : (
                      <span className="inline-block w-6 h-6 text-gray-300 select-none">–</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}