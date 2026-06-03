"use client"

import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { store, type DocFile, type StampItem } from "@/lib/store"
import { fileRegistry } from "@/lib/file-registry"
import { cn } from "@/lib/utils"
import {
  FileText, Download, Share2, Send, Printer, ArrowLeft,
  ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, AlertCircle, XCircle, Eye,
  Calendar, User, Building2, Tag, Hash, Mail, GitBranch,
  History, MessageSquare, Shield, ExternalLink,
  Stamp, X, RotateCcw, Check, FileSpreadsheet, FileCode
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

const statusConfig: Record<string, { icon: typeof CheckCircle2; cls: string; label: string }> = {
  "Approuve": { icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700", label: "Approuve" },
  "En validation": { icon: Clock, cls: "bg-amber-100 text-amber-700", label: "En validation" },
  "En attente": { icon: AlertCircle, cls: "bg-blue-100 text-blue-700", label: "En attente" },
  "Rejete": { icon: XCircle, cls: "bg-red-100 text-red-700", label: "Rejete" },
}

const typeColor: Record<string, string> = {
  pdf: "bg-red-100 text-red-700",
  docx: "bg-blue-100 text-blue-700",
  xlsx: "bg-emerald-100 text-emerald-700",
  img: "bg-purple-100 text-purple-700",
}

function MockDocumentView({ doc, zoom }: { doc: DocFile; zoom: number }) {
  const scale = zoom / 100
  const isTotal = doc.name.toLowerCase().includes("total")
  const isOrange = doc.name.toLowerCase().includes("orange")
  const isMtn = doc.name.toLowerCase().includes("mtn")
  const isEcowater = doc.name.toLowerCase().includes("ecowater")
  const isCdi = doc.name.toLowerCase().includes("cdi")
  const isNda = doc.name.toLowerCase().includes("nda")
  const isContrat = doc.name.toLowerCase().includes("contrat")
  const isXlsx = doc.type === "xlsx"
  const isRapport = doc.name.toLowerCase().includes("rapport") || doc.name.toLowerCase().includes("budget") === false && doc.type === "pdf" && !isTotal && !isOrange && !isMtn && !isEcowater

  // We wrap the component in a responsive layout that scales perfectly via CSS transform
  return (
    <div 
      className="shadow-2xl border border-border bg-white text-black relative select-none overflow-hidden rounded-md transition-shadow"
      style={{
        width: `${794 * scale}px`,
        height: `${1123 * scale}px`,
      }}
    >
      <div 
        className="origin-top-left flex flex-col justify-between bg-white text-black"
        style={{
          width: "794px",
          height: "1123px",
          transform: `scale(${scale})`,
          padding: "50px",
        }}
      >
        {/* Render Invoice: TOTAL */}
        {isTotal && (
          <div className="flex-1 flex flex-col justify-between h-full text-slate-800 text-[12px] leading-relaxed">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-orange-500 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span className="text-orange-500">TOTAL</span> ENERGIE SA
                  </h1>
                  <p className="text-[10px] text-slate-500 mt-1">Boulevard Valéry Giscard d&apos;Estaing, Abidjan</p>
                  <p className="text-[10px] text-slate-500">Tél: +225 27 21 25 40 00 | support@total.ci</p>
                </div>
                <div className="text-right">
                  <div className="bg-orange-500 text-white font-bold px-3 py-1 text-[11px] rounded uppercase tracking-wide">FACTURE D&apos;ÉNERGIE</div>
                  <p className="font-semibold text-slate-900 mt-2">Facture N°: <span className="font-mono">{doc.numero || "FAC-2026-0041"}</span></p>
                  <p className="text-slate-500 text-[10px]">Date d&apos;émission: {doc.date}</p>
                  <p className="text-slate-500 text-[10px]">Période: Avril 2026</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Émetteur</p>
                  <p className="font-semibold text-slate-900 mt-1">TOTAL ENERGIE CÔTE D&apos;IVOIRE</p>
                  <p className="text-slate-600 text-[11px]">Département Facturation Électricité</p>
                  <p className="text-slate-500 text-[10px] mt-1">N° CC: 0102450 Q | RCCM: CI-ABJ-1978-B-320</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client</p>
                  <p className="font-bold text-slate-900 mt-1">AKIENI GROUP</p>
                  <p className="text-slate-600 text-[11px]">Direction Administrative & Financière</p>
                  <p className="text-slate-500 text-[10px] mt-1">Siège social, Cocody Mermoz, Abidjan</p>
                </div>
              </div>

              <div className="mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-2">Description des prestations</th>
                      <th className="py-2 text-center w-16">Qté</th>
                      <th className="py-2 text-right w-24">Tarif Unit. HT</th>
                      <th className="py-2 text-right w-28">Total HT (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="text-slate-700">
                      <td className="py-3 font-medium">Consommation Électricité Basse/Moyenne Tension (compteur #MT-4801)</td>
                      <td className="py-3 text-center">1</td>
                      <td className="py-3 text-right font-mono">4 085 170</td>
                      <td className="py-3 text-right font-mono font-semibold">4 085 170</td>
                    </tr>
                    <tr className="text-slate-700">
                      <td className="py-3 font-medium">Redevance puissance souscrite (160 kVA) et taxes communales</td>
                      <td className="py-3 text-center">1</td>
                      <td className="py-3 text-right font-mono">735 330</td>
                      <td className="py-3 text-right font-mono font-semibold">735 330</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex justify-between items-start">
                <div className="w-1/2 bg-amber-50/50 border border-amber-200/50 p-3 rounded">
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Règlement & Conditions</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Facture payable sous 30 jours à réception par virement bancaire sur notre compte principal ECOBANK CI. Mentionner impérativement la référence facture.</p>
                </div>
                <div className="w-52 space-y-1.5 text-right font-medium">
                  <div className="flex justify-between text-slate-500">
                    <span>Total Net HT:</span>
                    <span className="font-mono">4 820 500</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>TVA (18%):</span>
                    <span className="font-mono">867 690</span>
                  </div>
                  <div className="flex justify-between text-slate-900 text-sm font-bold border-t border-slate-200 pt-2">
                    <span>TOTAL TTC:</span>
                    <span className="font-mono text-orange-600">5 688 190 FCFA</span>
                  </div>
                </div>
              </div>
              <div className="text-center text-[9px] text-slate-400 mt-12 border-t border-slate-100 pt-4 font-mono">
                TOTAL ENERGIE SA — Capital de 10 000 000 000 FCFA — RC CI-ABJ-1978-B-320 — Compte Ecobank: CI059 01101 12151608901 32
              </div>
            </div>
          </div>
        )}

        {/* Render Invoice: ORANGE */}
        {isOrange && (
          <div className="flex-1 flex flex-col justify-between h-full text-slate-800 text-[12px] leading-relaxed">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b-2 border-orange-500 pb-4">
                <div>
                  <div className="w-12 h-12 bg-orange-500 flex items-center justify-center text-white font-black text-xl rounded-lg">orange</div>
                  <p className="text-[10px] text-slate-500 mt-2 font-semibold">Orange Côte d&apos;Ivoire S.A.</p>
                  <p className="text-[9px] text-slate-400">Siège social: Boulevard de la République, Plateau</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-bold text-orange-500 tracking-wide uppercase">FACTURE MOBILE PRO</h2>
                  <p className="font-semibold text-slate-900 mt-2">N° Facture: <span className="font-mono">{doc.numero || "FAC-2026-0041"}</span></p>
                  <p className="text-slate-500 text-[10px]">Date d&apos;émission: {doc.date}</p>
                  <p className="text-slate-500 text-[10px]">Période de facturation: {doc.date.split("-")[1] === "04" ? "Avril 2026" : "Mars 2026"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-slate-100 rounded bg-slate-50/50">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Identifiant Client</p>
                  <p className="font-bold text-slate-800 mt-0.5">AKIENI GROUP</p>
                  <p className="text-[10px] text-slate-500">Code client: CLI-48102-AK</p>
                  <p className="text-[10px] text-slate-500">Adresse: Cocody Mermoz, Cité BAD</p>
                </div>
                <div className="p-3 border border-slate-100 rounded bg-slate-50/50">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Flotte Mobile</p>
                  <p className="font-medium text-slate-800 mt-0.5">Abonnement Flotte Corporate</p>
                  <p className="text-[10px] text-slate-500">Lignes actives: {doc.montant === 1310000 ? "47 lignes" : "45 lignes"}</p>
                  <p className="text-[10px] text-slate-500">Responsable Télécom: A. Diallo</p>
                </div>
              </div>

              <div className="mt-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                      <th className="py-2">Détail des abonnements & communications</th>
                      <th className="py-2 text-center w-16">Volume</th>
                      <th className="py-2 text-right w-28">Tarif HT (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="text-slate-700">
                      <td className="py-3 font-medium">Abonnements forfaitaires mensuels illimités Business Pro</td>
                      <td className="py-3 text-center">47</td>
                      <td className="py-3 text-right font-mono">1 050 000</td>
                    </tr>
                    <tr className="text-slate-700">
                      <td className="py-3 font-medium">Consommation data internet hors forfait et Roaming international</td>
                      <td className="py-3 text-center">1</td>
                      <td className="py-3 text-right font-mono">260 000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Prélèvement automatique</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[300px]">Le montant de cette facture sera prélevé automatiquement le 15 du mois en cours sur votre compte chèque BICICI CI01002.</p>
                </div>
                <div className="w-52 space-y-1 text-right font-medium">
                  <div className="flex justify-between text-slate-500">
                    <span>Total HT:</span>
                    <span className="font-mono">1 110 169</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>TVA (18%):</span>
                    <span className="font-mono">199 831</span>
                  </div>
                  <div className="flex justify-between text-slate-900 text-sm font-bold border-t border-slate-200 pt-2">
                    <span>TOTAL TTC:</span>
                    <span className="font-mono text-orange-500">{doc.montant ? doc.montant.toLocaleString() : "1 310 000"} FCFA</span>
                  </div>
                </div>
              </div>
              <div className="text-center text-[8px] text-slate-400 mt-12 border-t border-slate-100 pt-4 font-mono">
                Orange Côte d&apos;Ivoire — SA avec CA au capital de 12 500 000 000 FCFA — Boulevard de la République — N° CC: 9508901 G
              </div>
            </div>
          </div>
        )}

        {/* Render Invoice: MTN */}
        {isMtn && (
          <div className="flex-1 flex flex-col justify-between h-full text-slate-800 text-[12px] leading-relaxed">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-yellow-500 pb-4">
                <div>
                  <div className="w-14 h-8 bg-yellow-400 flex items-center justify-center text-slate-900 font-extrabold text-sm rounded-full border border-yellow-500">MTN</div>
                  <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wide">MTN Business CI</p>
                  <p className="text-[9px] text-slate-400">Cocody, Boulevard de l&apos;Université, Abidjan</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">FACTURE ACCÈS INTERNET</h2>
                  <p className="font-semibold text-slate-900 mt-2">N° Facture: <span className="font-mono">{doc.numero || "MTN-BIZ-2026-0087"}</span></p>
                  <p className="text-slate-500 text-[10px]">Date d&apos;émission: {doc.date}</p>
                </div>
              </div>

              <div className="p-3 border border-yellow-100 rounded bg-yellow-50/10">
                <p className="text-[9px] text-yellow-600 font-bold uppercase tracking-wider">Client & Facturation</p>
                <p className="font-bold text-slate-850 mt-0.5">AKIENI GROUP</p>
                <p className="text-[10px] text-slate-500">Ligne Fibre Dédiée PME 1 Gbps symétrique</p>
                <p className="text-[10px] text-slate-500">Identifiant Technique: FIB-MTN-AKI-88</p>
              </div>

              <div className="mt-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                      <th className="py-2">Description du Service</th>
                      <th className="py-2 text-center w-16">Période</th>
                      <th className="py-2 text-right w-28">Tarif TTC (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-slate-700">
                      <td className="py-3 font-semibold text-slate-800">
                        Abonnement Internet Fibre Dédiée 1 Gbps
                        <span className="block text-[10px] font-normal text-slate-400 mt-0.5">Inclus adresse IP fixe publique & support GTR 4h</span>
                      </td>
                      <td className="py-3 text-center text-slate-500">Mars 2026</td>
                      <td className="py-3 text-right font-mono font-bold">850 000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex justify-between items-start">
                <div className="text-[10px] text-slate-500">
                  <p className="font-bold text-slate-700">Service Client Pro</p>
                  <p className="mt-1">Tél: 111 (Gratuit depuis un mobile MTN)</p>
                  <p>Email: corporate.sales@mtn.ci</p>
                </div>
                <div className="w-52 space-y-1 text-right font-medium">
                  <div className="flex justify-between text-slate-950 font-extrabold text-sm border-t-2 border-yellow-400 pt-2">
                    <span>NET À PAYER:</span>
                    <span className="font-mono">{doc.montant ? doc.montant.toLocaleString() : "850 000"} FCFA</span>
                  </div>
                </div>
              </div>
              <div className="text-center text-[8px] text-slate-400 mt-12 border-t border-slate-100 pt-4 font-mono">
                MTN Côte d&apos;Ivoire S.A. au capital de 23 000 000 000 FCFA — Plateau, Avenue Nogues — CC N° 1008082 Y
              </div>
            </div>
          </div>
        )}

        {/* Render Invoice: ECOWATER */}
        {isEcowater && (
          <div className="flex-1 flex flex-col justify-between h-full text-slate-800 text-[12px] leading-relaxed">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-blue-500 pb-4">
                <div>
                  <h1 className="text-lg font-black text-blue-600 tracking-wide flex items-center gap-1">
                    ECOWATER <span className="text-slate-400 text-xs font-normal">SERVICES</span>
                  </h1>
                  <p className="text-[9px] text-slate-400 mt-1">Traitement & Maintenance des réseaux d&apos;eau</p>
                </div>
                <div className="text-right">
                  <h2 className="text-sm font-bold text-slate-800 uppercase">FACTURE INTERNE</h2>
                  <p className="font-semibold text-slate-900 mt-1">N°: <span className="font-mono">{doc.numero || "ECO-2026-0008"}</span></p>
                  <p className="text-slate-500 text-[10px]">Date: {doc.date}</p>
                </div>
              </div>

              <div className="mt-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase">
                      <th className="py-2">Prestation de Services</th>
                      <th className="py-2 text-center w-12">Qté</th>
                      <th className="py-2 text-right w-24">Prix (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-slate-700">
                      <td className="py-3 font-medium">Livraison bonbonnes d&apos;eau minérale pure 18.9L pour fontaines du siège</td>
                      <td className="py-3 text-center">20</td>
                      <td className="py-3 text-right font-mono">150 000</td>
                    </tr>
                    <tr className="text-slate-700">
                      <td className="py-3 font-medium">Forfait nettoyage trimestriel & détartrage hygiénique de 4 fontaines</td>
                      <td className="py-3 text-center">1</td>
                      <td className="py-3 text-right font-mono">75 000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex justify-between items-end">
                <p className="text-[10px] text-slate-400">Ecowater Services CI, Abidjan Zone 4 — RCCM CI-ABJ-2015-B-14021</p>
                <div className="w-48 text-right font-bold text-sm text-slate-900 border-t border-blue-500 pt-2">
                  Total Net: <span className="font-mono text-blue-600">225 000 FCFA</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Render Spreadsheet view (xlsx) */}
        {isXlsx && (
          <div className="flex-1 flex flex-col h-full bg-slate-100 border border-slate-300 rounded overflow-hidden text-slate-700 text-[11px] select-none">
            {/* Sheet Tabs Header */}
            <div className="bg-slate-200 px-3 py-2 border-b border-slate-300 flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Microsoft Excel — {doc.name}
              </span>
              <span className="text-[10px] bg-slate-300/60 px-2 py-0.5 rounded text-slate-600 font-mono">Feuille Active: PREVISIONNEL</span>
            </div>

            {/* Matrix View */}
            <div className="flex-1 overflow-auto bg-white grid grid-cols-[50px_1fr_120px_120px_120px_130px] border-b border-slate-300">
              {/* Header Columns */}
              <div className="bg-slate-100 border-r border-b border-slate-300 h-6"></div>
              {["A", "B", "C", "D", "E"].map((col, i) => (
                <div key={i} className="bg-slate-100 font-semibold border-r border-b border-slate-300 text-center h-6 flex items-center justify-center text-slate-500">
                  {col}
                </div>
              ))}

              {/* Rows */}
              {/* Title row */}
              <div className="bg-slate-100 border-r border-b border-slate-200 h-8 flex items-center justify-center text-slate-400 font-semibold">1</div>
              <div className="col-span-5 bg-emerald-700 text-white font-bold px-4 h-8 flex items-center text-sm border-b border-slate-200 uppercase tracking-wide">
                BUDGET PRÉVISIONNEL AKIENI GROUP - PREMIER TRIMESTRE 2026
              </div>

              {/* Table Column Labels */}
              <div className="bg-slate-100 border-r border-b border-slate-300 h-7 flex items-center justify-center text-slate-400 font-semibold">2</div>
              <div className="bg-slate-50 border-r border-b border-slate-300 font-bold px-2 flex items-center text-slate-800">Catégories Budgétaires</div>
              <div className="bg-slate-50 border-r border-b border-slate-300 font-bold px-2 flex items-center justify-end text-slate-800">Janvier (FCFA)</div>
              <div className="bg-slate-50 border-r border-b border-slate-300 font-bold px-2 flex items-center justify-end text-slate-800">Février (FCFA)</div>
              <div className="bg-slate-50 border-r border-b border-slate-300 font-bold px-2 flex items-center justify-end text-slate-800">Mars (FCFA)</div>
              <div className="bg-slate-50 border-b border-slate-300 font-bold px-2 flex items-center justify-end text-slate-800 bg-emerald-50 text-emerald-800">TOTAL Q1</div>

              {/* Row 3 */}
              <div className="bg-slate-100 border-r border-b border-slate-200 h-7 flex items-center justify-center text-slate-400">3</div>
              <div className="border-r border-b border-slate-200 px-2 flex items-center font-medium">Charges Opérationnelles</div>
              <div className="border-r border-b border-slate-200 px-2 flex items-center justify-end font-mono">4 000 000</div>
              <div className="border-r border-b border-slate-200 px-2 flex items-center justify-end font-mono">4 200 000</div>
              <div className="border-r border-b border-slate-200 px-2 flex items-center justify-end font-mono">4 300 000</div>
              <div className="border-b border-slate-200 px-2 flex items-center justify-end font-mono font-bold bg-slate-50">12 500 000</div>

              {/* Row 4 */}
              <div className="bg-slate-100 border-r border-b border-slate-200 h-7 flex items-center justify-center text-slate-400">4</div>
              <div className="border-r border-b border-slate-200 px-2 flex items-center font-medium">Investissements Technologiques</div>
              <div className="border-r border-b border-slate-200 px-2 flex items-center justify-end font-mono">1 500 000</div>
              <div className="border-r border-b border-slate-200 px-2 flex items-center justify-end font-mono">850 000</div>
              <div className="border-r border-b border-slate-200 px-2 flex items-center justify-end font-mono">850 000</div>
              <div className="border-b border-slate-200 px-2 flex items-center justify-end font-mono font-bold bg-slate-50">3 200 000</div>

              {/* Row 5 */}
              <div className="bg-slate-100 border-r border-b border-slate-200 h-7 flex items-center justify-center text-slate-400">5</div>
              <div className="border-r border-b border-slate-200 px-2 flex items-center font-medium">Masse Salariale Directe</div>
              <div className="border-r border-b border-slate-200 px-2 flex items-center justify-end font-mono">2 810 000</div>
              <div className="border-r border-b border-slate-200 px-2 flex items-center justify-end font-mono">2 820 000</div>
              <div className="border-r border-b border-slate-200 px-2 flex items-center justify-end font-mono">2 820 000</div>
              <div className="border-b border-slate-200 px-2 flex items-center justify-end font-mono font-bold bg-slate-50">8 450 000</div>

              {/* Row 6 */}
              <div className="bg-slate-100 border-r border-slate-200 h-8 flex items-center justify-center text-slate-400 font-semibold">6</div>
              <div className="border-r border-slate-200 px-2 flex items-center font-bold text-emerald-800 uppercase bg-emerald-50/50">TOTAL TRIMESTRIEL</div>
              <div className="border-r border-slate-200 px-2 flex items-center justify-end font-mono font-bold bg-emerald-50/50">8 310 000</div>
              <div className="border-r border-slate-200 px-2 flex items-center justify-end font-mono font-bold bg-emerald-50/50">7 870 000</div>
              <div className="border-r border-slate-200 px-2 flex items-center justify-end font-mono font-bold bg-emerald-50/50">7 970 000</div>
              <div className="px-2 flex items-center justify-end font-mono font-extrabold text-sm bg-emerald-100 text-emerald-900 border-t border-slate-300">24 150 000</div>
            </div>

            {/* Bottom sheets navigation */}
            <div className="bg-slate-100 px-2 py-1.5 flex items-center gap-1 border-t border-slate-350 select-none">
              <span className="px-3 py-1 bg-white border border-slate-300 rounded font-semibold text-emerald-800 cursor-pointer shadow-sm">Budget Q1</span>
              <span className="px-3 py-1 hover:bg-slate-200 text-slate-600 rounded cursor-pointer transition-colors">Dépenses Réelles</span>
              <span className="px-3 py-1 hover:bg-slate-200 text-slate-600 rounded cursor-pointer transition-colors">Écarts & Graphiques</span>
            </div>
          </div>
        )}

        {/* Render Legal Contracts (CDI, NDA, Contrat) */}
        {(isCdi || isNda || isContrat) && (
          <div className="flex-1 flex flex-col justify-between h-full bg-stone-50/20 border border-stone-200 p-8 shadow-inner font-serif text-[11.5px] leading-relaxed text-slate-900 select-text">
            <div className="space-y-6">
              {/* Document Stamp Header */}
              <div className="text-center space-y-1 select-none font-sans">
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">AK COMPLIANCE / SERVICE JURIDIQUE</p>
                <div className="h-px bg-slate-200 w-16 mx-auto" />
              </div>

              {/* Title */}
              <div className="text-center font-bold text-sm tracking-wide text-slate-950 uppercase py-2">
                {isCdi && "CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE"}
                {isNda && "ACCORD DE CONFIDENTIALITÉ ET DE NON-DIVULGATION"}
                {isContrat && "CONTRAT-CADRE DE FOURNITURE DE SERVICES IT"}
              </div>

              {/* Legal intro */}
              <p className="indent-6 text-justify">
                {isCdi && "ENTRE LES SOUSSIGNÉS : La société AKIENI GROUP, Société Anonyme au capital de 10 000 000 000 FCFA, dont le siège social est situé à Abidjan Cocody, représentée par M. Christian Boka, en sa qualité de Directeur Général, ci-après dénommée \"L'Employeur\", d'une part,"}
                {isNda && "ENTRE : AKIENI GROUP S.A., représentée par son mandataire dûment habilité M. Christian Boka, d&apos;une part, ET la société PARTENAIRE X, représentée par ses représentants légaux, d&apos;autre part. Les parties conviennent de collaborer dans le cadre d&apos;études de projets communs, ci-après dénommé \"Le Projet\"."}
                {isContrat && "IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT : La société AKIENI GROUP confie au Prestataire de services désigné par accord mutuel la livraison, le déploiement et la maintenance continue de ses systèmes informatiques professionnels à compter de la date de signature de la présente convention."}
              </p>
              <p className="indent-6 text-justify">
                {isCdi && "ET : Monsieur Jean-Marc BOKA, demeurant professionnellement à Abidjan, ci-après désigné \"Le Salarié\", d'autre part."}
              </p>

              {/* Articles */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-950">
                    {isCdi && "Article 1 — Fonctions et Qualité de Recrutement"}
                    {isNda && "Article 1 — Nature des Informations Protégées"}
                    {isContrat && "Article 1 — Objet de la prestation technique"}
                  </h4>
                  <p className="text-justify mt-1 text-slate-700">
                    {isCdi && "Le Salarié est recruté au poste de Responsable Général de la Sécurité des Systèmes d'Information (RSSI) au sein du pôle Technologique de l'entreprise. À ce titre, il prendra sous sa responsabilité directe la gouvernance sécurité et l&apos;encadrement opérationnel technique du département."}
                    {isNda && "Les parties reconnaissent que toutes les informations financières, technologiques, d&apos;ingénierie et de développement transmises dans le cadre des négociations du Projet sont strictement confidentielles et ne devront faire l&apos;objet d&apos;aucune diffusion non autorisée."}
                    {isContrat && "Le Prestataire s&apos;engage à livrer du matériel informatique haute performance (serveurs, routeurs, postes clients) et assurer une assistance technique continue H24 pour prévenir toute panne au sein du réseau d&apos;Akieni."}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-950">
                    {isCdi && "Article 2 — Rémunération et Avantages Sociaux"}
                    {isNda && "Article 2 — Durée de Validité & Sanctions"}
                    {isContrat && "Article 2 — Rémunération contractuelle forfaitaire"}
                  </h4>
                  <p className="text-justify mt-1 text-slate-700">
                    {isCdi && "En contrepartie de l'exercice de ses fonctions professionnelles, le Salarié percevra un salaire de base mensuel forfaitaire brut de 1 850 000 FCFA (Un million huit cent cinquante mille francs CFA). Il bénéficiera également des bonus de performance annuels fixés par la Direction."}
                    {isNda && "Cet engagement de confidentialité est conclu pour une durée ferme de 5 (cinq) années à compter de la date de signature des présentes. En cas de violation flagrante, des sanctions financières de 25 000 000 FCFA seront applicables."}
                    {isContrat && "En contrepartie des services techniques de maintenance, le Prestataire se verra verser une rémunération forfaitaire mensuelle de 3 500 000 FCFA hors taxe, payable à 30 jours à réception de facture."}
                  </p>
                </div>
              </div>
            </div>

            {/* Legal signatures */}
            <div className="border-t border-slate-200 pt-6 mt-auto">
              <p className="text-center font-medium italic text-slate-500 mb-6">Fait à Abidjan, en deux exemplaires originaux faisant foi, le {doc.date}</p>
              <div className="flex justify-between px-8 text-center font-bold text-slate-900 select-none">
                <div>
                  <p className="text-[10px] uppercase font-sans tracking-wide text-slate-400 font-bold mb-1">Pour l&apos;Employeur / Akieni</p>
                  <p className="italic text-xs font-serif font-semibold text-slate-700">C. Boka</p>
                  <p className="text-[9px] text-slate-400 font-normal font-sans mt-0.5">Signature & Cachet</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-sans tracking-wide text-slate-400 font-bold mb-1">Pour le Salarié / Tiers</p>
                  <p className="italic text-xs font-serif font-semibold text-slate-700">Lu et approuvé</p>
                  <p className="text-[9px] text-slate-400 font-normal font-sans mt-0.5">Jean-Marc Boka</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Render consolidated Financial Report (cover page style) */}
        {isRapport && (
          <div className="flex-1 flex flex-col justify-between h-full border border-blue-900 p-12 bg-slate-50 font-sans text-slate-800 text-[12px] leading-relaxed">
            <div className="space-y-8 mt-12 text-center">
              <p className="text-[10px] tracking-widest text-blue-800 font-extrabold uppercase">RAPPORT FINANCIER GROUPE</p>
              
              <div className="space-y-4 py-8 border-y-2 border-blue-900">
                <h1 className="text-2xl font-black text-slate-950 tracking-tight leading-tight">
                  RAPPORT ANNUEL & DE SYNTHÈSE DES COMPTES DE L&apos;EXERCICE
                </h1>
                <p className="text-sm text-blue-700 font-bold uppercase tracking-wider">Premier Trimestre Consolide (Q1 2026)</p>
              </div>

              <div className="max-w-md mx-auto grid grid-cols-3 gap-3 pt-6 text-left">
                <div className="p-3 bg-white border border-slate-200 rounded shadow-sm">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Chiffre d&apos;Affaires</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">45.2M FCFA</p>
                  <p className="text-[9px] text-emerald-600 font-bold">+12% vs Q4</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded shadow-sm">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">EBITDA Marge</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">12.3M FCFA</p>
                  <p className="text-[9px] text-emerald-600 font-bold">27% de marge</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded shadow-sm">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Trésorerie Nette</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">22.1M FCFA</p>
                  <p className="text-[9px] text-blue-600 font-bold">Consolidee</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6 text-center text-slate-500 text-[10px]">
              <p className="font-semibold text-slate-700">Direction Générale — AKIENI Group Finance</p>
              <p className="mt-1">Ce document contient des informations confidentielles destinées exclusivement aux membres du Conseil d&apos;Administration.</p>
              <p className="mt-6 text-[8px] text-slate-400 font-mono">Date de génération: {doc.date} — IP d&apos;origine: 192.168.1.100</p>
            </div>
          </div>
        )}

        {/* Fallback View for any unknown document file */}
        {!isTotal && !isOrange && !isMtn && !isEcowater && !isXlsx && !isCdi && !isNda && !isContrat && !isRapport && (
          <div className="flex-1 flex flex-col justify-between h-full bg-slate-50 border border-slate-200 rounded p-12 text-slate-700 text-[12px] leading-relaxed">
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <FileText className="h-10 w-10 text-slate-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 truncate max-w-[400px]">{doc.name}</h3>
                  <p className="text-[10px] text-slate-400">Importé le {doc.date} par {doc.author}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Description & Description Technique</h4>
                <p className="text-slate-600 leading-relaxed text-justify">{doc.description}</p>
                
                <div className="bg-white border border-slate-200 p-4 rounded text-[11px] space-y-1 text-slate-500">
                  <p className="font-bold text-slate-700 mb-2">Métadonnées du document :</p>
                  <p>Type de fichier : {doc.type.toUpperCase()}</p>
                  <p>Taille en mémoire : {doc.size}</p>
                  <p>Confiance OCR générale : {doc.confidence}%</p>
                  <p>Source du document : {doc.source.toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6 text-center text-[10px] text-slate-400">
              GED AKIENI — Document ID : <span className="font-mono text-slate-500">{doc.id}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DocumentPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [doc, setDoc] = useState<DocFile | null>(null)
  const [zoom, setZoom] = useState(100)
  const [comment, setComment] = useState("")

  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isStampingMode, setIsStampingMode] = useState(false)
  const [selectedStamp, setSelectedStamp] = useState<"APPROUVÉ" | "PAYÉ" | "REFUSÉ" | null>(null)
  const [stampPos, setStampPos] = useState({ x: 50, y: 50 })
  const [stampRotation, setStampRotation] = useState(0)
  const [isDraggingStamp, setIsDraggingStamp] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const found = store.getDocument(params.id as string)
    setDoc(found || null)

    // Check search params for auto-stamping
    const action = searchParams?.get("action")
    if (action === "stamp") {
      setIsStampingMode(true)
    }
  }, [params.id, searchParams])

  useEffect(() => {
    if (doc) {
      const url = fileRegistry.createObjectURL(doc.id)
      if (url) {
        setFileUrl(url)
      }
    }
  }, [doc])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isStampingMode || !selectedStamp) return
    e.preventDefault()
    setIsDraggingStamp(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    updateStampPosition(e)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingStamp) return
    updateStampPosition(e)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingStamp) return
    setIsDraggingStamp(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const updateStampPosition = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    let x = ((e.clientX - rect.left) / rect.width) * 100
    let y = ((e.clientY - rect.top) / rect.height) * 100
    
    // Clamp to 0-100%
    x = Math.max(2, Math.min(98, x))
    y = Math.max(2, Math.min(98, y))
    
    setStampPos({ x, y })
  }

  const handleConfirmStamp = () => {
    if (!doc || !selectedStamp) return
    const colors: Record<string, "green" | "blue" | "red"> = {
      APPROUVÉ: "green",
      PAYÉ: "blue",
      REFUSÉ: "red",
    }
    
    store.addStampToDocument(doc.id, {
      text: selectedStamp,
      color: colors[selectedStamp],
      x: stampPos.x,
      y: stampPos.y,
      rotation: stampRotation,
    })

    // Reload document to reflect stamp and status updates
    const updated = store.getDocument(doc.id)
    if (updated) setDoc(updated)

    setIsStampingMode(false)
    setSelectedStamp(null)
  }

  if (!doc) {
    return (
      <Shell>
        <Header />
        <main className="p-4 flex items-center justify-center h-[calc(100vh-56px)]">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Document non trouve</p>
            <Button variant="outline" className="mt-4 rounded" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </main>
      </Shell>
    )
  }

  const status = statusConfig[doc.status] || statusConfig["En attente"]
  const StatusIcon = status.icon

  return (
    <Shell>
      <Header />
      <main className="flex h-[calc(100vh-56px)]">
        {/* Left: Document Viewer */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted/30">
          {/* Toolbar */}
          {isStampingMode ? (
            <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-b border-amber-500/20 bg-card">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Stamp className="h-3.5 w-3.5" /> Mode Tampon
                </span>
                <span className="text-xs text-muted-foreground hidden md:inline">Sélectionnez un tampon et glissez-le sur le document.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg">
                  {[
                    { text: "APPROUVÉ", style: "border-emerald-600 text-emerald-600 bg-emerald-50" },
                    { text: "PAYÉ", style: "border-blue-700 text-blue-700 bg-blue-50" },
                    { text: "REFUSÉ", style: "border-red-600 text-red-600 bg-red-50" }
                  ].map(stampOpt => (
                    <button
                      key={stampOpt.text}
                      onClick={() => setSelectedStamp(stampOpt.text as any)}
                      className={cn(
                        "px-2.5 py-1 rounded transition-all",
                        selectedStamp === stampOpt.text 
                          ? "bg-white text-black shadow-sm font-black scale-[1.05]" 
                          : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <span className={cn("px-1.5 py-0.5 rounded font-mono border-2 text-[10px] font-bold", stampOpt.style)}>
                        {stampOpt.text}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedStamp && (
                  <div className="flex items-center gap-2 border-l border-border pl-2 mr-2">
                    <span className="text-[10px] text-muted-foreground">Rotation:</span>
                    <input 
                      type="range" 
                      min="-45" 
                      max="45" 
                      value={stampRotation} 
                      onChange={e => setStampRotation(Number(e.target.value))}
                      className="w-16 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-muted-foreground w-6">{stampRotation}°</span>
                  </div>
                )}

                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setIsStampingMode(false)
                    setSelectedStamp(null)
                  }}
                  className="h-8 text-xs rounded"
                >
                  Annuler
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleConfirmStamp}
                  disabled={!selectedStamp}
                  className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded"
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> Confirmer
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="h-4 w-px bg-border" />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(50, z - 25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground w-12 text-center">{zoom}%</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(200, z + 25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsStampingMode(true)}
                  className="h-8 gap-1.5 text-xs rounded border-amber-500/30 text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                >
                  <Stamp className="h-3.5 w-3.5" />
                  Tamponner
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  Telecharger
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                  <Share2 className="h-3.5 w-3.5" />
                  Partager
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                  <Printer className="h-3.5 w-3.5" />
                  Imprimer
                </Button>
              </div>
            </div>
          )}

          {/* Preview area */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div 
              ref={containerRef}
              onPointerDown={handlePointerDown} 
              onPointerMove={handlePointerMove} 
              onPointerUp={handlePointerUp}
              className={cn(
                "relative shadow-xl rounded border border-border select-none",
                isStampingMode && selectedStamp ? "cursor-crosshair" : ""
              )}
              style={{
                width: fileUrl ? `${(595 * zoom) / 100}px` : "auto",
                height: fileUrl ? `${(842 * zoom) / 100}px` : "auto",
                transition: "width 0.2s, height 0.2s",
              }}
            >
              {fileUrl ? (
                doc.type === "pdf" ? (
                  <iframe
                    src={fileUrl}
                    className="w-full h-full border-0 rounded bg-white"
                    title={doc.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white rounded">
                    <img
                      src={fileUrl}
                      alt={doc.name}
                      className="max-w-full max-h-full object-contain pointer-events-none"
                    />
                  </div>
                )
              ) : (
                <MockDocumentView doc={doc} zoom={zoom} />
              )}

              {/* Permanent stamps overlay */}
              {doc.stamps?.map(stamp => (
                <div
                  key={stamp.id}
                  className="absolute pointer-events-none select-none z-10"
                  style={{
                    left: `${stamp.x}%`,
                    top: `${stamp.y}%`,
                    transform: `translate(-50%, -50%) rotate(${stamp.rotation}deg) scale(${zoom / 100})`,
                  }}
                >
                  <div className={cn(
                    "px-2.5 py-1 font-mono font-black border-[3px] rounded-lg tracking-wider text-[10px] shadow-sm bg-white/95 uppercase rotate-[-3deg]",
                    stamp.color === "green" ? "border-emerald-600 text-emerald-600 bg-emerald-50/50" :
                    stamp.color === "blue" ? "border-blue-600 text-blue-600 bg-blue-50/50" :
                    "border-red-650 text-red-650 bg-red-50/50"
                  )}>
                    {stamp.text}
                    <div className="text-[6px] font-sans font-semibold tracking-normal text-muted-foreground text-center mt-0.5 border-t border-muted/50 pt-0.5">
                      {stamp.author} • {stamp.date.split(" ")[0]}
                    </div>
                  </div>
                </div>
              ))}

              {/* Stamping placement stamp */}
              {isStampingMode && selectedStamp && (
                <div
                  className={cn(
                    "absolute select-none z-20 pointer-events-none",
                    isDraggingStamp ? "cursor-grabbing" : "cursor-grab"
                  )}
                  style={{
                    left: `${stampPos.x}%`,
                    top: `${stampPos.y}%`,
                    transform: `translate(-50%, -50%) rotate(${stampRotation}deg) scale(${zoom / 100})`,
                  }}
                >
                  <div className={cn(
                    "px-2.5 py-1 font-mono font-black border-[3px] rounded-lg tracking-wider text-[10px] shadow-md bg-white/90 uppercase animate-pulse",
                    selectedStamp === "APPROUVÉ" ? "border-emerald-500 text-emerald-500" :
                    selectedStamp === "PAYÉ" ? "border-blue-500 text-blue-500" :
                    "border-red-500 text-red-500"
                  )}>
                    {selectedStamp}
                    <div className="text-[6px] font-sans font-semibold text-center mt-0.5 border-t border-slate-200/50 pt-0.5 text-slate-500">
                      C. Boka • EN COURS
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Page navigation */}
          <div className="flex items-center justify-center gap-4 py-2 border-t border-border bg-card">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">Page 1 sur 1</span>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="w-96 border-l border-border bg-card flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.size} · {doc.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-[10px] rounded px-2", status.cls)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
              <Badge className={cn("text-[10px] rounded px-2", typeColor[doc.type])}>
                {doc.type.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="metadata" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4 h-10">
              <TabsTrigger value="metadata" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground">
                Metadonnees
              </TabsTrigger>
              <TabsTrigger value="workflow" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground">
                Workflow
              </TabsTrigger>
              <TabsTrigger value="versions" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground">
                Versions
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground">
                Activite
              </TabsTrigger>
            </TabsList>

            <TabsContent value="metadata" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
              {/* Index fields */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Champs d&apos;index</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Building2, label: "Direction", value: "Finance" },
                    { icon: Calendar, label: "Date", value: doc.date },
                    { icon: User, label: "Auteur", value: doc.author },
                    { icon: Hash, label: "Confiance OCR", value: `${doc.confidence}%` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="p-2 bg-muted/40 rounded">
                      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <Icon className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source */}
              {(doc.linkedEmail || doc.linkedWorkflow || doc.source !== "upload") && (
                <div className="space-y-2 p-3 bg-muted/50 rounded">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Source</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] rounded px-2 gap-1">
                      {doc.source === "email" && <Mail className="h-2.5 w-2.5" />}
                      {doc.source === "workflow" && <GitBranch className="h-2.5 w-2.5" />}
                      {doc.source === "scan" && <Eye className="h-2.5 w-2.5" />}
                      {doc.source}
                    </Badge>
                  </div>
                  {doc.linkedEmail && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> {doc.linkedEmail}
                    </p>
                  )}
                  {doc.linkedWorkflow && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <GitBranch className="h-3 w-3" /> {doc.linkedWorkflow}
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Description</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{doc.description}</p>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {doc.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Edit button */}
              <Button variant="outline" className="w-full h-8 text-xs rounded gap-1.5">
                <Shield className="h-3 w-3" />
                Modifier les metadonnees
              </Button>
            </TabsContent>

            <TabsContent value="workflow" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Circuit de validation</p>
                <div className="space-y-3">
                  {[
                    { step: "Verification Comptable", user: "J. Martin", status: "done", date: "22-04-2026" },
                    { step: "Approbation Manager", user: "C. Boka", status: "current", date: "En attente" },
                    { step: "Validation DG", user: "Direction", status: "pending", date: "-" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        item.status === "done" ? "bg-emerald-100 text-emerald-600" :
                        item.status === "current" ? "bg-amber-100 text-amber-600" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {item.status === "done" ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : item.status === "current" ? (
                          <Clock className="h-3.5 w-3.5" />
                        ) : (
                          <span className="text-[10px] font-medium">{i + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{item.step}</p>
                        <p className="text-[11px] text-muted-foreground">{item.user} · {item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actions rapides</p>
                <div className="flex gap-2">
                  <Button className="flex-1 h-8 text-xs rounded gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approuver
                  </Button>
                  <Button variant="outline" className="flex-1 h-8 text-xs rounded gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    Rejeter
                  </Button>
                </div>
                <Textarea
                  placeholder="Ajouter un commentaire (obligatoire pour rejet)..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="text-xs rounded resize-none"
                  rows={2}
                />
              </div>
            </TabsContent>

            <TabsContent value="versions" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Historique des versions</p>
                <div className="space-y-2">
                  {doc.versions.map((v, i) => (
                    <div
                      key={v.version}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded border transition-colors",
                        i === 0 ? "border-foreground/20 bg-muted/50" : "border-border hover:bg-muted/30"
                      )}
                    >
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <History className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">
                          Version {v.version}
                          {i === 0 && <span className="ml-2 text-[10px] text-muted-foreground">(actuelle)</span>}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{v.author} · {v.date}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Journal d&apos;audit</p>
                <div className="space-y-0">
                  {doc.activity.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">
                          <span className="font-medium">{a.user}</span>
                          {" "}
                          <span className="text-muted-foreground">{a.action}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">{a.date} · IP: {a.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </Shell>
  )
}
