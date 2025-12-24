# 🧁 Jenny Doces - Sistema de Gestão para Confeitaria

![Jenny Doces Banner](https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&w=1200&q=80)

> Um sistema moderno, intuitivo e completo para gerenciar pedidos, orçamentos, clientes e produtos de sua confeitaria.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcmsinformatica%2Fgestao_confeitaria)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Funcionalidades

O **Jenny Doces** foi projetado para simplificar o dia a dia de confeiteiras e confeiteiros:

*   **📊 Dashboard Inteligente**: Visão geral do negócio com métricas de faturamento, pedidos pendentes e próximas entregas.
*   **📝 Gestão de Orçamentos**: Crie orçamentos detalhados com cálculo automático de preços, personalizações e taxas de entrega.
*   **🛍️ Catálogo de Produtos**: Cadastro completo de produtos com preços base, unidades (kg, unidade, caixa) e categorias.
*   **👥 Base de Clientes**: Histórico de pedidos, preferências e restrições alimentares de cada cliente.
*   **🎨 Personalizações**: Gerencie recheios, coberturas e decorações com precificação flexível.
*   **🔒 Segurança**: Autenticação robusta e proteção de dados via Supabase.

## 🚀 Tecnologias Utilizadas

*   **Frontend**: React, TypeScript, Vite
*   **UI/UX**: Tailwind CSS, Shadcn/ui, Lucide Icons
*   **Backend (BaaS)**: Supabase (PostgreSQL, Auth, Realtime)
*   **Gerenciamento de Estado**: TanStack Query (React Query)
*   **Deploy**: Vercel

## 🛠️ Instalação e Configuração

### Pré-requisitos

*   Node.js (v18+)
*   Conta no Supabase

### Passo a Passo

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/cmsinformatica/gestao_confeitaria.git
    cd gestao_confeitaria
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    ```

3.  **Configure o Supabase**
    *   Crie um novo projeto no Supabase.
    *   Rode o script SQL disponível em `supabase_schema.sql` no SQL Editor do Supabase para criar as tabelas.
    *   Crie um usuário no menu Authentication.

4.  **Configure as Variáveis de Ambiente**
    *   Crie um arquivo `.env` na raiz do projeto.
    *   Adicione suas credenciais:
        ```env
        VITE_SUPABASE_URL=sua_url_do_supabase
        VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
        ```

5.  **Rode o projeto**
    ```bash
    npm run dev
    ```

## 📱 Layout Responsivo

O sistema é totalmente responsivo, funcionando perfeitamente em computadores, tablets e celulares, permitindo que você gerencie sua confeitaria de onde estiver.

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se à vontade para usar e modificar.

---

Desenvolvido com 💖 para adoçar o mundo.
