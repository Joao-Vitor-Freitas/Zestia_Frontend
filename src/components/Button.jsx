export default function Button({ variant = '', ...p }) {
  return <button type="button" className={`btn ${variant}`} {...p} />
}
