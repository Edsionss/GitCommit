<template>
  <div class="form-container">
    <a-form
      :model="formState"
      :rules="rules"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <a-row :gutter="24">
        <!-- 左侧区域 -->
        <a-col :span="24">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item label="项目名称" name="projectName">
                <a-input v-model:value="formState.projectName" placeholder="项目名称" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="完成日期" name="completionDate">
                <a-date-picker v-model:value="formState.completionDate" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="人天" name="manDays">
                <a-input v-model:value="formState.manDays" placeholder="请输入人天" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-col :span="24">
            <a-form-item
              label="任务描述"
              name="taskDescription"
              :label-col="{ span: 8 / 3 }"
              :wrapper-col="{ span: 24 - 8 / 3 }"
            >
              <a-textarea v-model:value="formState.taskDescription" :rows="4" />
            </a-form-item>
          </a-col>

          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item label="评定人天" name="evaluationManDays">
                <a-input v-model:value="formState.evaluationManDays" placeholder="请输入评定人天" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="评定人天" name="evaluationManDays">
                <a-input v-model:value="formState.evaluationManDays" placeholder="请输入评定人天" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-col>
      </a-row>

      <!-- 提交按钮 -->
      <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
        <a-button type="primary" html-type="submit">提交</a-button>
        <a-button style="margin-left: 10px">取消</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { automaticallyFillApi } from '@api/automaticallyFill'

// 使用 TypeScript 定义表单数据的接口，提供类型安全
interface FormState {
  projectName: string
  completionDate: Dayjs | string
  taskDescription: string
  evaluationManDays: string
  manDays: string
}

// 初始化表单状态，使用 reactive
const formState = reactive<FormState>({
  projectName: '人天汇总',
  completionDate: dayjs(), // 匹配图片
  taskDescription: '',
  evaluationManDays: '',
  manDays: '5'
})

// 定义表单校验规则
const rules: Record<string, Rule[]> = {
  projectName: [{ required: true, message: '请输入或选择项目名称!' }],
  completionDate: [{ required: true, message: '请选择完成日期!' }],
  taskDescription: [{ required: true, message: '请输入任务描述!' }],
  manDays: [{ required: true, message: '请输入人天!' }]
}

// 表单提交成功的回调
const onFinish = async (values: FormState) => {
  const data = { ...values, completionDate: dayjs(values.completionDate).format('YYYY-MM-DD') }
  console.log('Success:', data)
  const res = await automaticallyFillApi.writeWorkRepo(data)
  if (res.success) {
    message.success(res.message)
  } else {
    message.error(res.message)
  }
}

// 表单提交失败的回调
const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
  message.error('表单校验失败，请检查!')
}
</script>

<style scoped>
.form-container {
  padding: 10px;
  background-color: var(--bg-container);
  border-radius: 0.5rem;
}
</style>
