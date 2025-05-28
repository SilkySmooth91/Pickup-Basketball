export default function FloatingLabel({ id, type, label, value, onChange }) {
  return (
    <div className="relative mb-4">
      <input
        type={type}
        id={id}
        placeholder=" "
        className="block w-full p-2 border border-gray-300 rounded peer"
        value={value}
        onChange={e => {
          // DEBUG: log per vedere se viene chiamato
          // console.log("FloatingLabel onChange", e.target.value);
          onChange(e);
        }}
        autoComplete="off"
      />
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