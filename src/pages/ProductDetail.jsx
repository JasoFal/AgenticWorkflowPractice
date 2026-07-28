import { useParams } from 'react-router'

export default function ProductDetail() {
  const { id } = useParams()

  return (
    <div className="units-row">
      <div className="unit-100">
        <h1>Product detail</h1>
        <p>
          Route parameter <code>id</code> resolved to <strong>{id}</strong>.
        </p>
        <p>The images[] gallery and product fields arrive in phase 4.</p>
      </div>
    </div>
  )
}
