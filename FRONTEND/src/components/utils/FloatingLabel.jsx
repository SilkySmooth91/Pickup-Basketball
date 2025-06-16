// Copyright (C) 2025 Pickup Basketball
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

export default function FloatingLabel({ id, type, label, value, onChange, asTextarea, rows, disabled, className }) {
  return (
    <div className="relative mb-4">
      {asTextarea ? (
        <textarea
          id={id}
          placeholder=" "
          className={`block w-full p-2 border border-gray-300 rounded peer min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-orange-600 ${className || ''}`}
          value={value}
          onChange={e => {
            onChange(e);
          }}
          rows={rows || 4}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          id={id}
          placeholder=" "
          className={`block w-full p-2 border border-gray-300 rounded peer focus:outline-none focus:ring-2 focus:ring-orange-600 ${className || ''}`}
          value={value}
          onChange={e => {
            onChange(e);
          }}
          autoComplete="off"
          disabled={disabled}
        />
      )}
      <label
        htmlFor={id}
        className="absolute text-sm text-gray-500 duration-300 
          transform -translate-y-1 scale-75 top-0 z-10 origin-[0] px-2 
          peer-placeholder-shown:px-2 
          peer-placeholder-shown:scale-100 
          peer-placeholder-shown:top-1/2 
          peer-placeholder-shown:-translate-y-1/2 
          peer-focus:top-0
          peer-focus:-translate-y-1
          peer-focus:scale-75
          peer-[:not(:placeholder-shown)]:top-0
          peer-[:not(:placeholder-shown)]:-translate-y-1
          peer-[:not(:placeholder-shown)]:scale-75
          left-1"
      >
        {label}
      </label>
    </div>
  )
}