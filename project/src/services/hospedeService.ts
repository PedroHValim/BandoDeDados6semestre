import { supabase } from '../lib/supabase'

export interface Hospede {
  id_hospede?: string
  nome: string
  sobrenome: string
  cpf: string
  telefone: string
  senha: string
}

export interface HospedeLogin {
  cpf: string
  senha: string
}

/**
 * Cadastrar novo hóspede no banco de dados
 */
export const cadastrarHospede = async (hospede: Hospede): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Verificar se o CPF já existe
    const { data: existingHospede } = await supabase
      .from('hospede')
      .select('cpf')
      .eq('cpf', hospede.cpf)
      .single()

    if (existingHospede) {
      return { success: false, error: 'CPF já cadastrado no sistema' }
    }

    // Inserir novo hóspede
    const { data, error } = await supabase
      .from('hospede')
      .insert([
        {
          nome: hospede.nome,
          sobrenome: hospede.sobrenome,
          cpf: hospede.cpf,
          telefone: hospede.telefone,
          senha: hospede.senha
        }
      ])
      .select()

    if (error) {
      console.error('Erro ao cadastrar hóspede:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data[0] }
  } catch (error: any) {
    console.error('Erro ao cadastrar hóspede:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Fazer login do hóspede (verificar se existe no banco)
 */
export const loginHospede = async (login: HospedeLogin): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    //basicamente cria um objeto, que será o resultado de uma filtração
    //do cpf de todos os itens do banco até que algum cpf da coluna cpf seja igual 
    //ao digitado no login. Assim retornando o Objeto inteiro do Supa
    const { data, error } = await supabase
      .from('hospede')
      .select('*')
      .eq('cpf', login.cpf)
      .single()
      

    if (error || !data) {
      return { success: false, error: 'CPF não encontrado no sistema.' }
    }
    
    //verificação do retorno do cpf com a senha digitada

    if (data.senha != login.senha) {
      return { success: false, error: 'Senha incorreta.' }
    }
    
    return { success: true, data }
  } catch (error: any) {
    console.error('Erro ao fazer login:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Buscar hóspede por CPF
 */
export const buscarHospedePorCPF = async (cpf: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('hospede')
      .select('*')
      .eq('cpf', cpf)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Erro ao buscar hóspede:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Buscar todos os hóspedes
 */
export const listarHospedes = async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('hospede')
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Erro ao listar hóspedes:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Atualizar dados do hóspede
 */
export const atualizarHospede = async (id_hospede: string, hospede: Partial<Hospede>): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('hospede')
      .update(hospede)
      .eq('id_hospede', id_hospede)
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data[0] }
  } catch (error: any) {
    console.error('Erro ao atualizar hóspede:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Deletar hóspede
 */
export const deletarHospede = async (id_hospede: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('hospede')
      .delete()
      .eq('id_hospede', id_hospede)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao deletar hóspede:', error)
    return { success: false, error: error.message }
  }
}

