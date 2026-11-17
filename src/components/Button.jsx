export default function Button({ variant = '', className = '', ...p }) {
  return <button type="button" className={`btn ${variant} ${className}`.trim()} {...p} />
}
