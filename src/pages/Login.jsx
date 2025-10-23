import React from 'react';

function Login() {
    return (
        <div class="flex flex-col items-center justify-center h-screen">
            <h1 class="text-2xl font-bold text-center" >Login</h1>
            <form class="flex flex-col gap-2">
                <input type="text" placeholder="Email" class="p-2 border border-gray-300 rounded"/>
                <input type="password" placeholder="Senha" class="p-2 border border-gray-300 rounded"/>
                <button type="submit" class="bg-blue-500 text-white p-2">Entrar</button>
                <button type="button" class="bg-gray-500 text-white p-2">Cadastrar</button>
            </form>
        </div>
    );
}

export default Login;
