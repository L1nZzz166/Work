<template>
  <div class="tourism-board">
    <!-- 顶部指标卡片 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value">{{ stats.total }}</div>
          <div class="metric-label">景点总数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value">{{ stats.avg_review_score }}</div>
          <div class="metric-label">平均评论分</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value">{{ stats.avg_hot_score }}</div>
          <div class="metric-label">平均热度评分</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value">{{ formatNumber(stats.total_review_count) }}</div>
          <div class="metric-label">累计评论量</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header><b>热门地区景点数量 TOP10</b></template>
          <div ref="regionChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header><b>景区等级分布</b></template>
          <div ref="levelChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mb-4">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header><b>热门标签 TOP10</b></template>
          <div ref="tagChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header><b>门票价格区间分布</b></template>
          <div ref="priceChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 推荐列表 -->
    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header><b>综合推荐 TOP10（热度+评论分+评论量加权）</b></template>
          <el-table :data="recommendList" size="small" max-height="520">
            <el-table-column type="index" label="#" width="45" />
            <el-table-column label="景点" min-width="180">
              <template #default="{ row }">
                <div class="scenic-cell">
                  <el-image v-if="row.image_url" :src="row.image_url" class="scenic-img" fit="cover" />
                  <div>
                    <div class="scenic-name">{{ row.name }}</div>
                    <div class="scenic-region">{{ row.region_name }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="综合分" width="80" align="center">
              <template #default="{ row }">
                <el-tag type="danger">{{ row.composite_score }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="hot_score" label="热度" width="60" align="center" />
            <el-table-column prop="review_score" label="评论分" width="70" align="center" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header><b>热门景点排行 TOP10（按热度）</b></template>
          <el-table :data="topList" size="small" max-height="520">
            <el-table-column type="index" label="#" width="45" />
            <el-table-column label="景点" min-width="180">
              <template #default="{ row }">
                <div class="scenic-cell">
                  <el-image v-if="row.image_url" :src="row.image_url" class="scenic-img" fit="cover" />
                  <div>
                    <div class="scenic-name">{{ row.name }}</div>
                    <div class="scenic-region">{{ row.region_name }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="hot_score" label="热度" width="70" align="center" />
            <el-table-column prop="review_count" label="评论量" width="90" align="center" />
            <el-table-column prop="level" label="等级" width="60" align="center" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup name="scenicBoard">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as echarts from 'echarts';
import { GetStats, GetRecommend, GetTop } from '../scenic/api';

const stats = ref<any>({
    total: 0, avg_review_score: 0, avg_hot_score: 0, total_review_count: 0,
    region_distribution: [], level_distribution: [], type_distribution: [],
    top_tags: [], price_distribution: [], top_regions_by_review: [],
});
const recommendList = ref<any[]>([]);
const topList = ref<any[]>([]);

const regionChartRef = ref();
const levelChartRef = ref();
const tagChartRef = ref();
const priceChartRef = ref();

let charts: echarts.ECharts[] = [];

const formatNumber = (n: any) => {
    if (n == null) return '0';
    const num = Number(n);
    if (num >= 100000000) return (num / 100000000).toFixed(2) + ' 亿';
    if (num >= 10000) return (num / 10000).toFixed(1) + ' 万';
    return String(num);
};

const baseOption = (labels: string[], data: any[], color?: string) => {
    return {
        grid: { left: 10, right: 20, top: 30, bottom: 10, containLabel: true },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'category', data: labels, axisLabel: { rotate: 30, fontSize: 10 } },
        yAxis: { type: 'value' },
        series: [
            {
                type: 'bar',
                data,
                barMaxWidth: 28,
                itemStyle: { color: color || '#409EFF', borderRadius: [4, 4, 0, 0] },
            },
        ],
    };
};

const renderCharts = () => {
    const s = stats.value;
    // 地区分布
    const regionLabels = (s.region_distribution || []).map((x: any) => x.region_name);
    const regionData = (s.region_distribution || []).map((x: any) => x.count);
    // 等级分布
    const levelLabels = (s.level_distribution || []).map((x: any) => x.level);
    const levelData = (s.level_distribution || []).map((x: any) => x.count);
    // 标签分布（横向柱状图更易读）
    const tagLabels = (s.top_tags || []).map((x: any) => x.tag);
    const tagData = (s.top_tags || []).map((x: any) => x.count);
    // 价格分布
    const priceLabels = (s.price_distribution || []).map((x: any) => x.range);
    const priceData = (s.price_distribution || []).map((x: any) => x.count);

    if (regionChartRef.value) {
        const c = echarts.init(regionChartRef.value);
        c.setOption(baseOption(regionLabels, regionData, '#409EFF'));
        charts.push(c);
    }
    if (levelChartRef.value) {
        const c = echarts.init(levelChartRef.value);
        c.setOption({
            tooltip: { trigger: 'item' },
            legend: { bottom: 0 },
            series: [
                {
                    type: 'pie',
                    radius: ['40%', '68%'],
                    data: (s.level_distribution || []).map((x: any) => ({ name: x.level, value: x.count })),
                    label: { formatter: '{b}: {c}' },
                },
            ],
        });
        charts.push(c);
    }
    if (tagChartRef.value) {
        const c = echarts.init(tagChartRef.value);
        c.setOption({
            grid: { left: 10, right: 20, top: 10, bottom: 10, containLabel: true },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            xAxis: { type: 'value' },
            yAxis: { type: 'category', data: tagLabels.slice().reverse(), axisLabel: { fontSize: 10 } },
            series: [{ type: 'bar', data: tagData.slice().reverse(), barMaxWidth: 16, itemStyle: { color: '#67C23A', borderRadius: [0, 4, 4, 0] } }],
        });
        charts.push(c);
    }
    if (priceChartRef.value) {
        const c = echarts.init(priceChartRef.value);
        c.setOption({
            tooltip: { trigger: 'item' },
            legend: { bottom: 0 },
            series: [
                {
                    type: 'pie',
                    radius: '68%',
                    roseType: 'radius',
                    data: (s.price_distribution || []).map((x: any) => ({ name: x.range, value: x.count })),
                    label: { formatter: '{b}: {c}' },
                },
            ],
        });
        charts.push(c);
    }
};

const loadData = async () => {
    const [statsRes, recRes, topRes] = await Promise.all([
        GetStats({}),
        GetRecommend({ limit: 10 }),
        GetTop({ limit: 10 }),
    ]);
    stats.value = (statsRes as any).data || stats.value;
    recommendList.value = ((recRes as any).data || []).map((x: any) => ({ ...x, composite_score: x.composite_score }));
    topList.value = (topRes as any).data || [];
    await nextTick();
    renderCharts();
};

const handleResize = () => {
    charts.forEach((c) => c.resize());
};

onMounted(() => {
    loadData();
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    charts.forEach((c) => c.dispose());
    charts = [];
});
</script>

<style lang="scss" scoped>
.tourism-board {
    padding: 4px;
}
.metric-card {
    text-align: center;
    .metric-value {
        font-size: 30px;
        font-weight: 700;
        color: var(--el-color-primary);
        line-height: 1.2;
    }
    .metric-label {
        margin-top: 6px;
        font-size: 13px;
        color: var(--el-text-color-secondary);
    }
}
.chart {
    width: 100%;
    height: 320px;
}
.scenic-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    .scenic-img {
        width: 56px;
        height: 42px;
        border-radius: 4px;
        flex-shrink: 0;
    }
    .scenic-name {
        font-weight: 600;
    }
    .scenic-region {
        font-size: 12px;
        color: var(--el-text-color-secondary);
    }
}
</style>
