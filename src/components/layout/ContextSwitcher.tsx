import { useEffect, useState } from "react"
import { ChevronDown, Building2, Users, Check } from "lucide-react"

type TenantOption = {
  id: string
  label: string
  type: 'agency' | 'customer'
  category: 'demo' | 'customer' | 'agency'
  shopifyConnected?: boolean
  parentTenantId?: string | null
}

interface ContextSwitcherProps {
  options: TenantOption[]
  value?: string
  onChange: (id: string) => void
}

export function ContextSwitcher({ options, value, onChange }: ContextSwitcherProps) {
  const [open, setOpen] = useState(false)
  const current = options.find(o => o.id === value) ?? options[0]

  // Auto-sélectionner le premier tenant si aucun n'est sélectionné
  useEffect(() => {
    if (!value && options[0]) {
      onChange(options[0].id)
    }
  }, [options, value, onChange])

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => setOpen(false)
    if (open) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [open])

  if (!options.length) return null

  const agencyOptions = options.filter(o => o.type === 'agency')
  const customerOptions = options.filter(o => o.type === 'customer')

  const getTenantIcon = (option: TenantOption) => {
    return option.type === 'agency' ? Building2 : Users
  }

  const getTenantBadge = (option: TenantOption) => {
    if (option.category === 'demo') return '🧪'
    if (option.shopifyConnected) return '✅'
    return '⚠️'
  }

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button 
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {current && (
          <>
            <div className="flex items-center gap-2">
              {current.type === 'agency' ? 
                <Building2 className="h-4 w-4 text-blue-600" /> : 
                <Users className="h-4 w-4 text-green-600" />
              }
              <span className="text-sm font-medium text-gray-900">
                {current.label}
              </span>
              <span className="text-xs">
                {getTenantBadge(current)}
              </span>
            </div>
          </>
        )}
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 w-80 rounded-lg bg-white shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-2">
            {/* Section Agences */}
            {agencyOptions.length > 0 && (
              <>
                <div className="text-xs font-medium text-gray-500 px-2 py-1 uppercase tracking-wide">
                  Agences
                </div>
                {agencyOptions.map(option => (
                  <button
                    key={option.id}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-gray-50 transition-colors ${
                      option.id === value ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                    onClick={() => {
                      onChange(option.id)
                      setOpen(false)
                    }}
                  >
                    <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        Vue agence
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{getTenantBadge(option)}</span>
                      {option.id === value && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Section Clients */}
            {customerOptions.length > 0 && (
              <>
                <div className="text-xs font-medium text-gray-500 px-2 py-1 mt-3 uppercase tracking-wide">
                  Clients ({customerOptions.length})
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {customerOptions.map(option => (
                    <button
                      key={option.id}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-gray-50 transition-colors ${
                        option.id === value ? 'bg-green-50 border border-green-200' : ''
                      }`}
                      onClick={() => {
                        onChange(option.id)
                        setOpen(false)
                      }}
                    >
                      <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {option.shopifyConnected ? 'Shopify connecté' : 'Configuration requise'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getTenantBadge(option)}</span>
                        {option.id === value && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Message si mode démo */}
            {options.some(o => o.category === 'demo') && (
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
                <div className="text-xs text-amber-800">
                  🧪 <strong>Mode Démo</strong> - Données simulées pour la démonstration
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}